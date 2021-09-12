const getOptions = require('loader-utils').getOptions;
// 通过loader-utils中getOptions方法 获取loader配置时传入的options

module.exports = function loader(source) {
    const options = getOptions(this);

    // console.log(source);
    source = source.replace(/const/g, options.key);
    // console.log(source);
    source = source.replace(/我是不是很菜/g, '我菜的不行');
    // console.log(source);

    return source;
};