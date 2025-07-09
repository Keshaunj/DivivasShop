const bcrypt = require('bcrypt');
const User = require("../models/User")

const signupUser = async (req,res) => {
    try{
        const { username, password } = req.body;

        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.state
            // delete the signupUser code above and restart becuase your starbucks is closing push up code now to save
        }
    }
}
