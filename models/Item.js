module.exports = (mongoose) => {
    var schema = mongoose.Schema({
        id : Number,
        title : String,
        status: String,
        image: String,
        link: String,
        release: String,
        price: {
            type: String,
            default: null
        },
        down_payment: {
            type: String,
            default: null
        },
        created_at: { 
            type: Date,
            default: new Date
        },
    });
        
    const Schema = mongoose.model('Item', schema);
    return Schema
}