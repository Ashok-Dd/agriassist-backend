import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    phonenumber:{
        type:String,
        required:true,
        unique:true,
        match: /^[6-9]\d{9}$/
    },
   
    name:{
        type:String,
        required:true,
        trim:true
    },
    language:{
        type:String,
        enum:['telugu','hindi','english'],
        default:'telugu'
    },
    location:{
        state:String,
        district:String,
        mandal:String,
        village:String,
        coordinates:{
            latitude: Number,
            longitude: Number
        }
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    farmProfiles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm'
    }],
    preferences: {
      notifications: {
        disease: { type: Boolean, default: true },
        fertilizer: { type: Boolean, default: true },
        irrigation: { type: Boolean, default: true },
        market: { type: Boolean, default: true }
    },
    units: {
      area: { type: String, enum: ['acre', 'hectare'], default: 'acre' },
      weight: { type: String, enum: ['kg', 'quintal'], default: 'quintal' }
    }
  }
}, {
  timestamps: true
});


userSchema.pre('save', function(next) {
    if (this.phonenumber) {
        this.phonenumber = this.phonenumber.toString();
    }
    next();
});



export const User = mongoose.model('User',userSchema)