const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    themeID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    path: {
        type: String,
        required: true,
        trim: true
    }
});

// Indexes
themeSchema.index({ themeID: 1 });

module.exports = mongoose.model('Theme', themeSchema);