function Test() {
}
Test.prototype.func1 = function () {
    this.func2();
};
Test.prototype.func2 = function () {
};
module.exports = Test;
