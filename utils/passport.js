const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models/userModel");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        console.log(email)
        console.log(password)
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Email not registered" });
        }
        const isPasswordValid = await user.isPasswordMatched(password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid Credentials" });
        }
          
        if (user.isBlock) {
          /* checking the user is blocked or not */
          const messages = `OOPS! your Account ${user.email} is blocked for your suspicious acitivity,Please contact our customer team  for further assistance`;
          return done(null, false, { message: messages });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});

module.exports = passport;
