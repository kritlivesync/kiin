module.exports = async(info, next) => {
    console.log('Parsing session from request...');
    L.session(info.req, {}, () => {
        console.log(info.req.session);
        next(true);
    });
};