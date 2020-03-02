const mongoose = require('mongoose');
var mongo_config = {
    useNewUrlParser:true,
    useUnifiedTopology: true
}
mongoose.connect(process.env.MONGO_URI, mongo_config, function (err) {
    if (err) throw err;
});
var Item = require('./Item')(mongoose)

module.exports = {
    Item,
    Schema: mongoose.Schema
}