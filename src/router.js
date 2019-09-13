const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const sampleSize = require('lodash/sampleSize');
const shuffle = require('lodash/shuffle');
const union = require('lodash/union');

router.get('/', (req, res) => {
    res.send('<h1>APIs hosted properly</h1>');
})

router.get('/data', (req, res) => {
    let filePath = path.resolve(__dirname, "EduCompQuiz_data.json")
    if (fs.existsSync(filePath)) {
        let str = fs.readFileSync(filePath);
        let json = JSON.parse(str)
        let easyQts = json.filter(p => p.difficulty == 'E')
        let medQts = json.filter(p => p.difficulty == 'M')
        let hardQts = json.filter(p => p.difficulty == 'H')

        return res.send(shuffle(union(sampleSize(easyQts, 5), sampleSize(medQts, 3), sampleSize(hardQts, 2))))
    } else {
        res.send([])
    }
})

module.exports = router;