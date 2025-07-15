const { ExtractJwt, Strategy } = require('passport-jwt');
const passport = require('passport');
const { prisma } = require('./prisma/queries');

function initPassport() {
    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    };
    
    const strategy = new Strategy(opts, async(payload, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            if (user) {
                return done(null, user.username);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, null);
        }
    });
    
    passport.use(strategy);
};

module.exports = initPassport;