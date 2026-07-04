const mongoose=require("mongoose");

const instructorSchema=new mongoose.Schema({

name:String,

email:String,

password: { type: String, default: "instructor123" }

});

module.exports=mongoose.model("Instructor",instructorSchema);