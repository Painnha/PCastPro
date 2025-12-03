// OBS Manager JavaScript
const obsManager = (function() {
    const obs = new OBSWebSocket();
    
    // --- DATA STORE ---
    let STORE = {
        pinned: [],   // ['sourceName1', 'sourceName2']
        links: {},    // { 'groupName': ['sourceA', 'sourceB'] }
        contents: {}, // { 'sourceName': 'lastKnownContent/url/path' }
        cameraData: {
            players: {
                A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
            },
            cameras: {
                A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
            }
        }
    };

    // Cache danh sách source sau khi scan
    let CACHED_SCENES = [];
    let currentGroupName = '';

    // --- 1. CONNECTION ---
    async function connectOBS() {
        const btn = document.getElementById('obsBtnConnect');
        try {
            btn.innerText = "...";
            await obs.connect(`ws://${document.getElementById('obsIp').value}:${document.getElementById('obsPort').value}`, document.getElementById('obsPwd').value);
            btn.innerText = "Connected";
            btn.style.background = "#10b981";
            
            await loadStore();
            loadCameraData();
            scanSources();
            renderLinkGroups();
            obs.on('CurrentProgramSceneChanged', (data) => {
                highlightActiveScene(data.sceneName);
            });

        } catch (e) {
            alert("Lỗi kết nối: " + e.message);
            btn.innerText = "Connect";
            btn.style.background = "#3b82f6";
        }
    }

    // --- 2. SETUP & SCAN LOGIC ---
    async function scanSources() {
        try {
            const resp = await obs.call('GetSceneList');
            CACHED_SCENES = resp.scenes.reverse(); 
            
            const container = document.getElementById('obs-setup-container');
            const sceneGrid = document.getElementById('obs-scene-grid');
            
            container.innerHTML = '';
            sceneGrid.innerHTML = '';

            // Render Dashboard Buttons
            CACHED_SCENES.forEach(scene => {
                const btn = document.createElement('button');
                btn.className = 'scene-btn';
                btn.id = `obs-btn-scene-${scene.sceneName}`;
                btn.innerText = scene.sceneName;
                btn.onclick = () => obs.call('SetCurrentProgramScene', { sceneName: scene.sceneName });
                sceneGrid.appendChild(btn);

                // Render Setup Tree
                const sceneBlock = document.createElement('div');
                sceneBlock.className = 'scene-block';
                
                const header = document.createElement('div');
                header.className = 'scene-header';
                header.innerHTML = `<span>${scene.sceneName}</span> <i class="fas fa-chevron-down"></i>`;
                
                // Logic mở/đóng và load items
                header.onclick = async () => {
                    const content = sceneBlock.querySelector('.scene-items');
                    if(content.innerHTML === '') {
                        await renderSceneItems(scene.sceneName, content);
                    }
                    content.classList.toggle('open');
                };

                const itemsDiv = document.createElement('div');
                itemsDiv.className = 'scene-items';
                
                sceneBlock.appendChild(header);
                sceneBlock.appendChild(itemsDiv);
                container.appendChild(sceneBlock);
            });

            renderDashboard(); // Refresh UI Dashboard
            renderLinkGroups(); // Refresh Link Groups
        } catch (e) {
            alert("Lỗi quét Scene: " + e.message);
        }
    }

    async function renderSceneItems(sceneName, container) {
        container.innerHTML = '<div style="color:#888; text-align:center">Loading...</div>';
        
        try {
            let items = await getItemsRecursively(sceneName);
            
            container.innerHTML = ''; 
            
            if(items.length === 0) {
                container.innerHTML = '<div style="font-size:12px; padding:5px;">Trống</div>';
                return;
            }

            // Render items với nội dung
            for (let item of items) {
                // Chỉ hiển thị Text, Browser, Media, Image
                if(['input', 'scene'].includes(item.sourceType) || item.inputKind) { 
                     const row = document.createElement('div');
                     row.className = 'source-row';
                     
                     const isPinned = STORE.pinned.includes(item.sourceName);
                     const linkGroup = getLinkGroup(item.sourceName);
                     const isGroupItem = item.groupName ? `<span style='color:#e67e22'>[Group: ${item.groupName}]</span>` : '';

                     // Lấy nội dung đầy đủ của source
                     let sourceContent = '';
                     let contentType = ''; // 'text', 'url', 'local_file', 'file'
                     try {
                         const inputSettings = await obs.call('GetInputSettings', { inputName: item.sourceName });
                         const settings = inputSettings.inputSettings || {};
                         
                         if (settings.text) {
                             sourceContent = String(settings.text || '');
                             contentType = 'text';
                         } else if (settings.url) {
                             sourceContent = String(settings.url || '');
                             contentType = 'url';
                         } else if (settings.local_file) {
                             sourceContent = String(settings.local_file || '');
                             contentType = 'local_file';
                         } else if (settings.file) {
                             sourceContent = String(settings.file || '');
                             contentType = 'file';
                         }
                     } catch(e) {
                         sourceContent = '';
                         contentType = '';
                     }

                     // Lưu lại nội dung vào STORE
                     try {
                         if (!STORE.contents) STORE.contents = {};
                         if (sourceContent) {
                             STORE.contents[item.sourceName] = sourceContent;
                         }
                     } catch (eStore) {
                         console.warn('Không thể lưu contents vào STORE:', eStore);
                     }

                     // Escape HTML
                     const escapedContent = sourceContent.replace(/"/g, '&quot;').replace(/'/g, "&#39;");
                     const escapedTitle = sourceContent.replace(/"/g, '&quot;').replace(/'/g, "&#39;");
                     const escapedSourceNameAttr = item.sourceName.replace(/"/g, '&quot;');
                     const escapedContentTypeAttr = contentType.replace(/"/g, '&quot;');

                     row.innerHTML = `
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:bold; color: white;">${item.sourceName}</span>
                            <span class="obs-badge" style="width:fit-content">${item.inputKind || 'Source'} ${isGroupItem}</span>
                        </div>
                        
                        <div style="font-size: 11px; color: var(--accent);">
                            ${linkGroup ? `<i class="fas fa-link"></i> ${linkGroup}` : ''}
                        </div>

                        <div style="display:flex; gap:5px; align-items:center;">
                            <input type="text" 
                                class="source-content-input" 
                                value="${escapedContent}" 
                                placeholder="Nội dung/URL/Đường dẫn..."
                                data-source-name="${escapedSourceNameAttr}"
                                data-content-type="${escapedContentTypeAttr}"
                                onchange="obsManagerAPI.updateSourceFromSetupField(this)"
                                onkeydown="if(event.key === 'Enter') { obsManagerAPI.updateSourceFromSetupField(this); this.blur(); }"
                                title="${escapedTitle || 'Không có nội dung'}"
                            >
                            <button class="obs-icon-btn" 
                                onclick="obsManagerAPI.updateSourceFromSetupField(this.previousElementSibling)" 
                                title="Lưu"
                                style="flex-shrink: 0;">
                                <i class="fas fa-save"></i>
                            </button>
                        </div>

                        <div style="display:flex; gap:5px;">
                            <button class="obs-icon-btn ${isPinned?'active':''}" onclick="obsManagerAPI.togglePin('${item.sourceName.replace(/'/g, "\\'")}')" title="Ghim">
                                <i class="fas fa-thumbtack"></i>
                            </button>
                            <button class="obs-icon-btn ${linkGroup?'linked':''}" onclick="obsManagerAPI.setLink('${item.sourceName.replace(/'/g, "\\'")}')" title="Liên kết">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>

                        <div style="display:flex; gap:5px; justify-content: flex-end;">
                            <button class="obs-icon-btn" onclick="obsManagerAPI.toggleVis('${sceneName.replace(/'/g, "\\'")}', ${item.sceneItemId})" title="Ẩn/Hiện">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${ (item.inputKind === 'browser_source') ? 
                                `<button class="obs-icon-btn" onclick="obsManagerAPI.reloadBrowser('${item.sourceName.replace(/'/g, "\\'")}')" title="Reload Browser">
                                    <i class="fas fa-sync"></i>
                                </button>` : '' 
                            }
                        </div>
                     `;
                     container.appendChild(row);
                }
            }

        } catch(e) {
            container.innerHTML = `Error: ${e.message}`;
        }
    }

    async function getItemsRecursively(sceneNameOrGroupName, parentGroup = null) {
        let list = [];
        try {
            const resp = await obs.call('GetSceneItemList', { sceneName: sceneNameOrGroupName });
            
            for (let item of resp.sceneItems) {
                item.groupName = parentGroup;
                
                if (item.isGroup) {
                    list.push(item);
                    try {
                        const subItems = await getItemsRecursively(item.sourceName, item.sourceName);
                        list = list.concat(subItems);
                    } catch (errGroup) {
                        console.warn(`Không thể chui vào group ${item.sourceName}`, errGroup);
                    }
                } else {
                    list.push(item);
                }
            }
        } catch (e) {
            console.warn(`Skip quét: ${sceneNameOrGroupName} không phải là scene/group hợp lệ.`);
        }
        return list;
    }

    // --- 3. PIN & LINK LOGIC ---
    function togglePin(sourceName) {
        if(STORE.pinned.includes(sourceName)) {
            STORE.pinned = STORE.pinned.filter(s => s !== sourceName);
        } else {
            STORE.pinned.push(sourceName);
        }
        saveStore();
        const btn = event.currentTarget;
        btn.classList.toggle('active');
        renderDashboard();
    }

    function setLink(sourceName) {
        const currentGroup = getLinkGroup(sourceName);
        const newGroup = prompt("Nhập tên nhóm liên kết (nội dung):", currentGroup || "");
        if(newGroup === null) return; 
        
        if(currentGroup) {
            STORE.links[currentGroup] = STORE.links[currentGroup].filter(s => s !== sourceName);
            if(STORE.links[currentGroup].length === 0) delete STORE.links[currentGroup];
        }

        if(newGroup.trim() !== "") {
            if(!STORE.links[newGroup]) STORE.links[newGroup] = [];
            STORE.links[newGroup].push(sourceName);
        }
        saveStore();
        const btn = event.currentTarget;
        if(newGroup) btn.classList.add('linked'); else btn.classList.remove('linked');
        renderDashboard();
        renderLinkGroups();
    }

    function getLinkGroup(sourceName) {
        for(let group in STORE.links) {
            if(STORE.links[group].includes(sourceName)) return group;
        }
        return null;
    }

    // --- LINK GROUPS MANAGEMENT ---
    function renderLinkGroups() {
        const container = document.getElementById('obs-link-groups-container');
        if (!container) return;
        container.innerHTML = '';

        const groups = Object.keys(STORE.links);
        if(groups.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Chưa có nhóm liên kết nào. Tạo nhóm bằng cách click nút <i class="fas fa-link"></i> ở source trong danh sách bên dưới.</div>';
            return;
        }

        groups.forEach(groupName => {
            const sources = STORE.links[groupName] || [];
            const groupEl = document.createElement('div');
            groupEl.className = 'link-group-item';
            
            groupEl.innerHTML = `
                <div class="link-group-header">
                    <div class="link-group-title">${groupName.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}</div>
                    <button class="add-source-btn" onclick="obsManagerAPI.openSourcePickerForGroup('${groupName.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" title="Thêm source vào nhóm">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="link-group-sources">
                    ${sources.map(sourceName => `
                        <div class="source-tag">
                            <span>${sourceName}</span>
                            <span class="remove-btn" onclick="obsManagerAPI.removeSourceFromGroup('${groupName.replace(/'/g, "\\'")}', '${sourceName.replace(/'/g, "\\'")}')" title="Xóa">
                                <i class="fas fa-times"></i>
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(groupEl);
        });
    }

    function removeSourceFromGroup(groupName, sourceName) {
        if(confirm(`Bạn có chắc muốn xóa "${sourceName}" khỏi nhóm "${groupName}"?`)) {
            if(STORE.links[groupName]) {
                STORE.links[groupName] = STORE.links[groupName].filter(s => s !== sourceName);
                if(STORE.links[groupName].length === 0) {
                    delete STORE.links[groupName];
                }
                saveStore();
                renderLinkGroups();
                renderDashboard();
            }
        }
    }

    function openSourcePickerForGroup(groupName) {
        currentGroupName = groupName;
        const titleEl = document.getElementById('obsSourcePickerTitle');
        titleEl.textContent = `Thêm Source vào: ${groupName}`;
        document.getElementById('obsSourcePickerOverlay').classList.add('active');
        document.getElementById('obsSourcePickerSidebar').classList.add('active');
        
        renderScenesList();
        document.getElementById('obs-sources-column').innerHTML = `
            <div class="column-title">Sources</div>
            <div style="color: #666; font-size: 12px; padding: 10px;">Chọn một scene để xem sources</div>
        `;
    }

    function closeSourcePicker() {
        document.getElementById('obsSourcePickerOverlay').classList.remove('active');
        document.getElementById('obsSourcePickerSidebar').classList.remove('active');
        currentGroupName = '';
    }

    function renderScenesList() {
        const container = document.getElementById('obs-scenes-list-container');
        if (!container) return;
        container.innerHTML = '';

        if(CACHED_SCENES.length === 0) {
            container.innerHTML = '<div style="color: #666; font-size: 12px; padding: 10px;">Chưa có scene nào. Hãy quét lại.</div>';
            return;
        }

        CACHED_SCENES.forEach(scene => {
            const sceneEl = document.createElement('div');
            sceneEl.className = 'scene-list-item';
            sceneEl.textContent = scene.sceneName;
            sceneEl.onmouseenter = () => loadSourcesForScene(scene.sceneName);
            sceneEl.onclick = () => {
                document.querySelectorAll('.scene-list-item').forEach(el => el.classList.remove('active'));
                sceneEl.classList.add('active');
            };
            container.appendChild(sceneEl);
        });
    }

    async function loadSourcesForScene(sceneName) {
        const container = document.getElementById('obs-sources-column');
        container.innerHTML = '<div class="column-title">Sources</div><div style="color: #888; font-size: 12px; padding: 10px;">Đang tải...</div>';

        try {
            const items = await getItemsRecursively(sceneName);
            const sourcesInGroup = STORE.links[currentGroupName] || [];

            container.innerHTML = '<div class="column-title">Sources</div>';

            if(items.length === 0) {
                container.innerHTML += '<div style="color: #666; font-size: 12px; padding: 10px;">Scene này không có source nào.</div>';
                return;
            }

            const validItems = items.filter(item => 
                (['input', 'scene'].includes(item.sourceType) || item.inputKind)
            );

            if(validItems.length === 0) {
                container.innerHTML += '<div style="color: #666; font-size: 12px; padding: 10px;">Không có source hợp lệ.</div>';
                return;
            }

            validItems.forEach(item => {
                const isAlreadyAdded = sourcesInGroup.includes(item.sourceName);
                const sourceEl = document.createElement('div');
                sourceEl.className = 'source-list-item' + (isAlreadyAdded ? ' added' : '');
                sourceEl.innerHTML = `
                    <div>
                        <div style="font-weight: 600; color: white; font-size: 13px;">${item.sourceName}</div>
                        <div style="font-size: 11px; color: #aaa;">${item.inputKind || 'Source'}</div>
                    </div>
                    ${isAlreadyAdded ? '<span style="color: var(--success);"><i class="fas fa-check"></i> Đã thêm</span>' : ''}
                `;
                
                if(!isAlreadyAdded) {
                    sourceEl.onclick = () => addSourceToGroup(currentGroupName, item.sourceName);
                }
                
                container.appendChild(sourceEl);
            });
        } catch(e) {
            container.innerHTML = `<div style="color: var(--danger); font-size: 12px; padding: 10px;">Lỗi: ${e.message}</div>`;
        }
    }

    function addSourceToGroup(groupName, sourceName) {
        if(!STORE.links[groupName]) {
            STORE.links[groupName] = [];
        }
        
        if(!STORE.links[groupName].includes(sourceName)) {
            STORE.links[groupName].push(sourceName);
            saveStore();
            renderLinkGroups();
            renderDashboard();
            
            const activeScene = document.querySelector('.scene-list-item.active');
            if(activeScene) {
                loadSourcesForScene(activeScene.textContent);
            } else {
                const hoveredScene = document.querySelector('.scene-list-item:hover');
                if(hoveredScene) {
                    loadSourcesForScene(hoveredScene.textContent);
                }
            }
        }
    }

    // --- 4. DASHBOARD RENDER & ACTIONS ---
    async function renderDashboard() {
        const container = document.getElementById('obs-pinned-container');
        if (!container) return;
        container.innerHTML = '';

        if(STORE.pinned.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666; margin-top: 20px;">Chưa ghim source nào.</div>';
            return;
        }

        if (!STORE.contents) STORE.contents = {};

        let hasNewContent = false;
        for (let sourceName of STORE.pinned) {
            if (!STORE.contents[sourceName] || STORE.contents[sourceName] === '') {
                try {
                    const inputSettings = await obs.call('GetInputSettings', { inputName: sourceName });
                    const settings = inputSettings.inputSettings || {};
                    
                    if (settings.text) {
                        STORE.contents[sourceName] = String(settings.text || '');
                        hasNewContent = true;
                    } else if (settings.url) {
                        STORE.contents[sourceName] = String(settings.url || '');
                        hasNewContent = true;
                    } else if (settings.local_file) {
                        STORE.contents[sourceName] = String(settings.local_file || '');
                        hasNewContent = true;
                    } else if (settings.file) {
                        STORE.contents[sourceName] = String(settings.file || '');
                        hasNewContent = true;
                    } else {
                        STORE.contents[sourceName] = '';
                    }
                } catch(e) {
                    console.warn(`Không thể load nội dung cho ${sourceName}:`, e);
                    STORE.contents[sourceName] = '';
                }
            }
        }
        if (hasNewContent) {
            saveStore();
        }

        STORE.pinned.forEach(sourceName => {
            const group = getLinkGroup(sourceName);
            const currentValue = STORE.contents[sourceName] || '';
            const escapedValue = String(currentValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const escapedSourceName = sourceName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            const el = document.createElement('div');
            el.className = 'pinned-item';
            
            let html = `
                <div class="pinned-header">
                    <span style="font-weight:bold; color:white; font-size:14px;">${sourceName}</span>
                    ${group ? `<span class="obs-badge" style="background:var(--accent); color:white">${group}</span>` : ''}
                </div>
                <div style="margin-bottom:5px;">
                    <input type="text" class="obs-input-dark" placeholder="Nội dung/URL..." 
                        value="${escapedValue}"
                        onchange="obsManagerAPI.updateSourceContent('${escapedSourceName}', this.value)"
                        onkeydown="if(event.key === 'Enter') obsManagerAPI.updateSourceContent('${escapedSourceName}', this.value)"
                        title="${escapedValue || 'Không có nội dung'}"
                    >
                </div>
                <div class="pinned-controls">
                    <button class="obs-btn-sm" style="background:#333; color:white; width:40px" 
                            onclick="obsManagerAPI.toggleSourceVisiblityLinked('${escapedSourceName}')" title="Ẩn/Hiện (Linked)">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    <button class="obs-btn-sm" style="background:#333; color:white; flex:1" 
                            onclick="obsManagerAPI.reloadBrowser('${escapedSourceName}')">
                        <i class="fas fa-sync"></i> Reload ${group ? '(All)' : ''}
                    </button>
                </div>
            `;
            el.innerHTML = html;
            container.appendChild(el);
        });
    }

    // --- CORE ACTION FUNCTIONS ---
    async function updateSourceContent(sourceName, value) {
        const group = getLinkGroup(sourceName);
        let targets = [sourceName];

        if(group && STORE.links[group]) {
            targets = STORE.links[group];
        }

        try {
            const promises = targets.map(name => 
                obs.call('SetInputSettings', {
                    inputName: name,
                    inputSettings: { 
                        text: value,         
                        url: value,          
                        local_file: value    
                    }
                })
            );
            
            await Promise.all(promises);

            if (!STORE.contents) STORE.contents = {};
            targets.forEach(name => {
                STORE.contents[name] = value;
            });
            saveStore();

            const inputs = document.querySelectorAll('.obs-input-dark');
            inputs.forEach(i => { if(i.value === value) i.style.borderColor = '#10b981'; });
            setTimeout(() => inputs.forEach(i => i.style.borderColor = '#444'), 1000);
        } catch(e) {
            console.error(e);
        }
    }

    async function updateSourceFromSetupField(inputElement) {
        const sourceName = inputElement.getAttribute('data-source-name');
        const contentType = inputElement.getAttribute('data-content-type');
        const value = inputElement.value;
        await updateSourceFromSetup(sourceName, contentType, value);
    }

    async function updateSourceFromSetup(sourceName, contentType, value) {
        value = value || '';

        const group = getLinkGroup(sourceName);
        let targets = [sourceName];

        if(group && STORE.links[group]) {
            targets = STORE.links[group];
        }

        let inputSettings = {};
        
        if (contentType === 'text') {
            inputSettings = { text: value };
        } else if (contentType === 'url') {
            inputSettings = { url: value };
        } else if (contentType === 'local_file') {
            inputSettings = { local_file: value };
        } else if (contentType === 'file') {
            inputSettings = { file: value };
        } else {
            inputSettings = { 
                text: value,
                url: value,
                local_file: value,
                file: value
            };
        }

        try {
            const promises = targets.map(name => 
                obs.call('SetInputSettings', {
                    inputName: name,
                    inputSettings: inputSettings
                })
            );
            
            await Promise.all(promises);
            
            if (!STORE.contents) STORE.contents = {};
            targets.forEach(name => {
                STORE.contents[name] = value;
            });
            saveStore();
            
            const inputs = document.querySelectorAll(`input[data-source-name="${sourceName}"]`);
            inputs.forEach(input => {
                input.style.borderColor = '#10b981';
                setTimeout(() => {
                    input.style.borderColor = '#444';
                }, 1500);
            });
            
            console.log(`Đã cập nhật ${targets.length} source(s): ${targets.join(', ')}`);
        } catch(e) {
            console.error('Lỗi cập nhật source:', e);
            alert('Lỗi cập nhật: ' + e.message);
        }
    }

    async function updateHighlight() {
        alert("Bạn hãy Ghim (Pin) source Highlight vào Dashboard, sau đó dán link vào ô nhập liệu của source đó nhé!");
    }

    async function reloadBrowser(sourceName) {
        const group = getLinkGroup(sourceName);
        const targets = (group && STORE.links[group]) ? STORE.links[group] : [sourceName];

        try {
            const promises = targets.map(name => 
                obs.call('PressInputPropertiesButton', { 
                    inputName: name, 
                    propertyName: 'refreshnocache' 
                })
            );
            
            await Promise.all(promises);
            console.log(`Đã reload: ${targets.join(', ')}`);
        } catch(e) { 
            alert("Lỗi reload (Có thể source không phải browser): " + e.message); 
        }
    }

    async function toggleSourceVisiblityLinked(sourceName) {
        const group = getLinkGroup(sourceName);
        const targets = (group && STORE.links[group]) ? STORE.links[group] : [sourceName];

        try {
            const currentScene = await obs.call('GetCurrentProgramScene');
            const currentSceneName = currentScene.currentProgramSceneName;

            const sceneItemsResp = await obs.call('GetSceneItemList', { sceneName: currentSceneName });
            
            const itemsToToggle = sceneItemsResp.sceneItems.filter(item => targets.includes(item.sourceName));

            if(itemsToToggle.length === 0) {
                alert(`Các source "${targets.join(',')}" không có mặt trong Scene hiện tại (${currentSceneName}) nên không thể ẩn/hiện.`);
                return;
            }

            const isEnabled = itemsToToggle[0].sceneItemEnabled;
            const newState = !isEnabled;

            const promises = itemsToToggle.map(item => 
                obs.call('SetSceneItemEnabled', {
                    sceneName: currentSceneName,
                    sceneItemId: item.sceneItemId,
                    sceneItemEnabled: newState
                })
            );
            
            await Promise.all(promises);

        } catch(e) {
            console.error(e);
            alert("Lỗi toggle visibility: " + e.message);
        }
    }

    async function toggleVis(sceneName, itemId) {
        try {
            const item = await obs.call('GetSceneItemEnabled', { sceneName, sceneItemId: itemId });
            await obs.call('SetSceneItemEnabled', { sceneName, sceneItemId: itemId, sceneItemEnabled: !item.sceneItemEnabled });
        } catch(e) { console.error(e); }
    }

    async function saveReplayBuffer() {
        obs.call('SaveReplayBuffer').then(() => alert("Đã lưu Buffer!")).catch(() => alert("Lỗi: Hãy bật Replay Buffer trong OBS!"));
    }

    function highlightActiveScene(name) {
        document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`obs-btn-scene-${name}`);
        if(btn) btn.classList.add('active');
    }

    function switchOBSView(viewId) {
        document.querySelectorAll('.obs-view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById(viewId);
        if(view) view.classList.add('active');
        
        document.querySelectorAll('.obs-tab').forEach(t => t.classList.remove('active'));
        const tab = document.querySelector(`[data-obs-view="${viewId}"]`);
        if(tab) tab.classList.add('active');
    }

    async function saveStore() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Fallback to localStorage if not authenticated
                console.warn('Không có token, lưu vào localStorage');
                localStorage.setItem('obs_tool_store', JSON.stringify(STORE));
                return;
            }

            const response = await fetch('/api/obs/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pinned: STORE.pinned || [],
                    links: STORE.links || {},
                    contents: STORE.contents || {}
                })
            });

            if (!response.ok) {
                throw new Error('API call failed');
            }

            const result = await response.json();
            if (result.success) {
                console.log('Đã lưu cấu hình OBS vào database');
                // Also save to localStorage as backup
                localStorage.setItem('obs_tool_store', JSON.stringify(STORE));
            }
        } catch (e) {
            console.warn('Lỗi khi lưu vào database, lưu vào localStorage:', e);
            localStorage.setItem('obs_tool_store', JSON.stringify(STORE));
        }
    }

    async function loadStore() { 
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Fallback to localStorage if not authenticated
                console.warn('Không có token, load từ localStorage');
                const s = localStorage.getItem('obs_tool_store');
                if(s) {
                    try {
                        STORE = JSON.parse(s);
                    } catch (e) {
                        console.warn('Không thể parse STORE từ localStorage, dùng cấu trúc mặc định.', e);
                    }
                }
            } else {
                // Load from database
                const response = await fetch('/api/obs/config', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        STORE = {
                            pinned: result.data.pinned || [],
                            links: result.data.links || {},
                            contents: result.data.contents || {},
                            cameraData: {
                                players: {
                                    A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                                    B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
                                },
                                cameras: {
                                    A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                                    B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
                                }
                            }
                        };
                        console.log('Đã load cấu hình OBS từ database');
                        // Also save to localStorage as backup
                        localStorage.setItem('obs_tool_store', JSON.stringify(STORE));
                        return;
                    }
                } else {
                    throw new Error('API call failed');
                }
            }
        } catch (e) {
            console.warn('Lỗi khi load từ database, load từ localStorage:', e);
            const s = localStorage.getItem('obs_tool_store');
            if(s) {
                try {
                    STORE = JSON.parse(s);
                } catch (e) {
                    console.warn('Không thể parse STORE từ localStorage, dùng cấu trúc mặc định.', e);
                }
            }
        }
        
        // Ensure default structure
        if (!STORE.pinned) STORE.pinned = [];
        if (!STORE.links) STORE.links = {};
        if (!STORE.contents) STORE.contents = {};
        if (!STORE.cameraData) {
            STORE.cameraData = {
                players: {
                    A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                    B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
                },
                cameras: {
                    A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                    B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
                }
            };
        }
    }

    function stopCamera() {
        const video = document.getElementById('obsCamPreview');
        if(video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            
            // Reset button
            const btn = document.getElementById('obsCameraBtn');
            if(btn) {
                btn.innerHTML = 'Bật Cam';
                btn.disabled = false;
            }
            
            console.log('Đã dừng camera');
        }
    }

    // --- CAMERA MANAGEMENT FUNCTIONS ---
    
    // Lane mapping: Pick slot ID to lane name
    const LANE_MAP = {
        A: {
            'pickA1': 'Top',
            'pickA2': 'Jung',
            'pickA3': 'Mid',
            'pickA4': 'ADC',
            'pickA5': 'Support'
        },
        B: {
            'pickB5': 'Top',      // Team B has reverse order
            'pickB4': 'Jung',
            'pickB3': 'Mid',
            'pickB2': 'ADC',
            'pickB1': 'Support'
        }
    };

    function loadPlayerNamesFromPicks() {
        // Get player names from pick slots
        const teams = ['A', 'B'];
        let updated = false;

        teams.forEach(team => {
            Object.keys(LANE_MAP[team]).forEach(pickId => {
                const lane = LANE_MAP[team][pickId];
                const pickSlot = document.getElementById(pickId);
                
                if (pickSlot) {
                    const playerNameEl = pickSlot.querySelector('.player-name');
                    if (playerNameEl && playerNameEl.textContent.trim()) {
                        const playerName = playerNameEl.textContent.trim();
                        if (playerName && playerName !== 'Trống' && playerName !== '') {
                            STORE.cameraData.players[team][lane] = playerName;
                            
                            // Update input field
                            const inputEl = document.getElementById(`playerName_${team}_${lane}`);
                            if (inputEl) {
                                inputEl.value = playerName;
                            }
                            updated = true;
                        }
                    }
                }
            });
        });

        if (updated) {
            saveStore();
            alert('Đã tải tên tuyển thủ từ Pick slots!');
        } else {
            alert('Không tìm thấy tên tuyển thủ trong Pick slots. Hãy đảm bảo bạn đã nhập tên trong Ban/Pick Manager.');
        }
    }

    function updatePlayerNameFromInput(team, lane, newName) {
        STORE.cameraData.players[team][lane] = newName;
        
        // Also update the pick slot
        const pickId = Object.keys(LANE_MAP[team]).find(key => LANE_MAP[team][key] === lane);
        if (pickId) {
            const pickSlot = document.getElementById(pickId);
            if (pickSlot) {
                const playerNameEl = pickSlot.querySelector('.player-name');
                if (playerNameEl) {
                    playerNameEl.textContent = newName || '';
                    
                    // Broadcast update via WebSocket
                    if (window.banpickSocket && window.banpickSocket.readyState === WebSocket.OPEN) {
                        // Get all player names to broadcast
                        const allNames = [];
                        ['A', 'B'].forEach(t => {
                            ['Top', 'Jung', 'Mid', 'ADC', 'Support'].forEach(l => {
                                allNames.push(STORE.cameraData.players[t][l] || '');
                            });
                        });
                        
                        window.banpickSocket.send(JSON.stringify({ 
                            type: 'updateNames', 
                            names: allNames 
                        }));
                    }
                }
            }
        }
        
        saveStore();
    }

    function saveCameraData() {
        // Save camera links from input fields (only to localStorage)
        const teams = ['A', 'B'];
        const lanes = ['Top', 'Jung', 'Mid', 'ADC', 'Support'];

        teams.forEach(team => {
            lanes.forEach(lane => {
                const nameInput = document.getElementById(`playerName_${team}_${lane}`);
                const linkInput = document.getElementById(`cameraLink_${team}_${lane}`);
                
                if (nameInput) {
                    STORE.cameraData.players[team][lane] = nameInput.value || '';
                }
                if (linkInput) {
                    STORE.cameraData.cameras[team][lane] = linkInput.value || '';
                }
            });
        });

        // Save only to localStorage (not database)
        localStorage.setItem('camera_data', JSON.stringify(STORE.cameraData));
        alert('Đã lưu thông tin camera vào localStorage!');
    }

    function loadCameraData() {
        // Load camera data from localStorage only
        try {
            const savedData = localStorage.getItem('camera_data');
            if (savedData) {
                STORE.cameraData = JSON.parse(savedData);
            }
        } catch (e) {
            console.warn('Failed to load camera data from localStorage:', e);
        }

        // Ensure default structure
        if (!STORE.cameraData) {
            STORE.cameraData = {
                players: {
                    A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                    B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
                },
                cameras: {
                    A: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' },
                    B: { Top: '', Jung: '', Mid: '', ADC: '', Support: '' }
                }
            };
        }

        // Load into input fields
        const teams = ['A', 'B'];
        const lanes = ['Top', 'Jung', 'Mid', 'ADC', 'Support'];

        teams.forEach(team => {
            lanes.forEach(lane => {
                const nameInput = document.getElementById(`playerName_${team}_${lane}`);
                const linkInput = document.getElementById(`cameraLink_${team}_${lane}`);
                
                if (nameInput && STORE.cameraData.players && STORE.cameraData.players[team]) {
                    nameInput.value = STORE.cameraData.players[team][lane] || '';
                }
                if (linkInput && STORE.cameraData.cameras && STORE.cameraData.cameras[team]) {
                    linkInput.value = STORE.cameraData.cameras[team][lane] || '';
                }
            });
        });
    }

    function selectLane(lane) {
        // Remove active class from all lane buttons
        document.querySelectorAll('.camera-lane-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked lane buttons
        document.querySelectorAll(`.camera-lane-btn.lane-${lane.toLowerCase()}`).forEach(btn => {
            btn.classList.add('active');
        });

        // Get latest data from input fields
        const teams = ['A', 'B'];
        teams.forEach(team => {
            const nameInput = document.getElementById(`playerName_${team}_${lane}`);
            const linkInput = document.getElementById(`cameraLink_${team}_${lane}`);
            
            if (nameInput) {
                STORE.cameraData.players[team][lane] = nameInput.value || '';
            }
            if (linkInput) {
                STORE.cameraData.cameras[team][lane] = linkInput.value || '';
            }
        });

        // Prepare data for WebSocket broadcast
        // Even if empty, still broadcast to change background
        const teamAData = {
            playerName: STORE.cameraData.players.A[lane] || '',
            cameraLink: STORE.cameraData.cameras.A[lane] || ''
        };

        const teamBData = {
            playerName: STORE.cameraData.players.B[lane] || '',
            cameraLink: STORE.cameraData.cameras.B[lane] || ''
        };

        // Broadcast via WebSocket
        if (window.banpickSocket && window.banpickSocket.readyState === WebSocket.OPEN) {
            window.banpickSocket.send(JSON.stringify({
                type: 'selectLane',
                lane: lane,
                teamA: teamAData,
                teamB: teamBData
            }));
            
            console.log(`Selected lane: ${lane}`, { teamA: teamAData, teamB: teamBData });
        } else {
            console.warn('WebSocket not connected. Cannot broadcast lane selection.');
        }
    }

    // Hoán đổi dữ liệu camera giữa Team A và Team B theo từng lane
    function swapTeamsCameraData() {
        const lanes = ['Top', 'Jung', 'Mid', 'ADC', 'Support'];

        lanes.forEach(lane => {
            // Đảm bảo cấu trúc tồn tại
            if (!STORE.cameraData || !STORE.cameraData.players || !STORE.cameraData.cameras) {
                return;
            }

            // Hoán đổi tên tuyển thủ
            const tmpPlayer = STORE.cameraData.players.A[lane];
            STORE.cameraData.players.A[lane] = STORE.cameraData.players.B[lane];
            STORE.cameraData.players.B[lane] = tmpPlayer;

            // Hoán đổi link camera
            const tmpCam = STORE.cameraData.cameras.A[lane];
            STORE.cameraData.cameras.A[lane] = STORE.cameraData.cameras.B[lane];
            STORE.cameraData.cameras.B[lane] = tmpCam;

            // Cập nhật lại vào input trên UI nếu có
            const nameInputA = document.getElementById(`playerName_A_${lane}`);
            const nameInputB = document.getElementById(`playerName_B_${lane}`);
            const linkInputA = document.getElementById(`cameraLink_A_${lane}`);
            const linkInputB = document.getElementById(`cameraLink_B_${lane}`);

            if (nameInputA) nameInputA.value = STORE.cameraData.players.A[lane] || '';
            if (nameInputB) nameInputB.value = STORE.cameraData.players.B[lane] || '';
            if (linkInputA) linkInputA.value = STORE.cameraData.cameras.A[lane] || '';
            if (linkInputB) linkInputB.value = STORE.cameraData.cameras.B[lane] || '';
        });

        // Lưu lại vào localStorage (không popup alert)
        try {
            localStorage.setItem('camera_data', JSON.stringify(STORE.cameraData));
        } catch (e) {
            console.warn('Không thể lưu camera_data sau khi swap:', e);
        }
    }

    async function startCamera() {
        try {
            // Yêu cầu quyền truy cập camera trước (cần để lấy device labels)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Tắt ngay stream này để tắt đèn cam
                stream.getTracks().forEach(track => track.stop());
            } catch(e) {
                // Bỏ qua lỗi này, chúng ta sẽ xử lý sau
            }

            // Lấy danh sách tất cả các thiết bị video
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if(videoDevices.length === 0) {
                alert("Không tìm thấy thiết bị camera nào!");
                return;
            }

            // Tìm OBS Virtual Camera (thường có tên chứa "OBS" hoặc "Virtual Camera")
            let obsCamera = videoDevices.find(device => {
                const label = device.label.toLowerCase();
                return label.includes('obs') || 
                       label.includes('virtual camera') ||
                       label.includes('obs-virtual-camera');
            });

            let selectedDeviceId = null;
            
            // Nếu tìm thấy OBS Virtual Camera, ưu tiên dùng
            if(obsCamera) {
                selectedDeviceId = obsCamera.deviceId;
                console.log(`Đã tìm thấy OBS Virtual Camera: ${obsCamera.label}`);
            } else if(videoDevices.length === 1) {
                // Chỉ có 1 camera, dùng luôn
                selectedDeviceId = videoDevices[0].deviceId;
                console.log(`Sử dụng camera duy nhất: ${videoDevices[0].label || 'Camera 1'}`);
            } else {
                // Có nhiều camera nhưng không tìm thấy OBS Virtual Camera
                // Tạo danh sách camera để user chọn
                const cameraOptions = videoDevices.map((device, index) => 
                    `${index + 1}. ${device.label || `Camera ${index + 1}`}`
                ).join('\n');
                
                const message = `Không tìm thấy OBS Virtual Camera!\n\n` +
                              `Danh sách camera có sẵn:\n${cameraOptions}\n\n` +
                              `Vui lòng:\n` +
                              `1. Bật OBS Virtual Camera trong OBS Studio\n` +
                              `2. Hoặc chọn một camera từ danh sách trên (nhập số 1-${videoDevices.length})`;
                
                const choice = prompt(message);
                const cameraIndex = parseInt(choice) - 1;
                
                if(choice === null || choice === '') {
                    // User đã hủy
                    return;
                }
                
                if(cameraIndex >= 0 && cameraIndex < videoDevices.length) {
                    selectedDeviceId = videoDevices[cameraIndex].deviceId;
                } else {
                    alert("Lựa chọn không hợp lệ! Vui lòng nhập số từ 1 đến " + videoDevices.length);
                    return;
                }
            }

            // Lấy stream từ camera đã chọn
            const constraints = {
                video: {
                    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('obsCamPreview');
            
            // Dừng stream cũ nếu có
            if(video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
            
            if(video) {
                video.srcObject = stream;
                const deviceName = selectedDeviceId ? 
                    videoDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Unknown' : 
                    'Default';
                console.log(`Đã bật camera: ${deviceName}`);
                
                // Cập nhật text nút thành "Đang phát"
                const btn = document.getElementById('obsCameraBtn');
                if(btn) {
                    btn.innerHTML = '<i class="fas fa-video"></i> Đang phát';
                    btn.disabled = true;
                    
                    // Khi stream kết thúc, reset button
                    stream.getVideoTracks()[0].onended = () => {
                        btn.innerHTML = 'Bật Cam';
                        btn.disabled = false;
                    };
                }
            }
        } catch(e) {
            console.error('Lỗi bật camera:', e);
            
            let errorMessage = '';
            if(e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                errorMessage = "Không có quyền truy cập camera!\n\nVui lòng:\n1. Cho phép truy cập camera trong trình duyệt\n2. Reload trang và thử lại";
            } else if(e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                errorMessage = "Không tìm thấy camera!\n\nHãy đảm bảo:\n- Camera được kết nối\n- OBS Virtual Camera đã được bật trong OBS Studio\n- Trình duyệt có quyền truy cập camera";
            } else if(e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                errorMessage = `Camera đang được sử dụng bởi ứng dụng khác!\n\nVui lòng:\n- Đóng các ứng dụng đang sử dụng camera\n- Thử lại sau`;
            } else {
                errorMessage = `Lỗi bật camera: ${e.message}\n\nHãy đảm bảo:\n- Camera được kết nối\n- OBS Virtual Camera đã được bật trong OBS Studio (nếu cần)\n- Trình duyệt có quyền truy cập camera`;
            }
            
            alert(errorMessage);
        }
    }

    // Expose API
    return {
        connectOBS,
        scanSources,
        togglePin,
        setLink,
        removeSourceFromGroup,
        openSourcePickerForGroup,
        closeSourcePicker,
        updateSourceContent,
        updateSourceFromSetupField,
        updateHighlight,
        reloadBrowser,
        toggleSourceVisiblityLinked,
        toggleVis,
        saveReplayBuffer,
        startCamera,
        stopCamera,
        switchOBSView,
        renderDashboard,
        // Camera management functions
        loadPlayerNamesFromPicks,
        saveCameraData,
        loadCameraData,
        updatePlayerNameFromInput,
        selectLane,
        swapTeamsCameraData
    };
})();

// Expose to window for inline handlers
window.obsManagerAPI = obsManager;

