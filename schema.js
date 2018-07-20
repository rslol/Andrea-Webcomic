const mongoose = require('mongoose'),

var ComicSchema = new mongoose.Schema({
    title: String, 
    art: [
        {
            slide1: String, 
            slide2: String, 
            slide3: String, 
            slide4: String, 
            slide5: String
        }
    ], 
    date: String, 
    description: String
});

module.exports = mongoose.model('Comic', ComicSchema);