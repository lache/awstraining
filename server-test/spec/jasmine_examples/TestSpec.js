describe("Test", function() {

  var test;

  beforeEach(function() {
    test = new Test();
  });

  it("should call func2 inside func1", function() {
    spyOn(test, 'func2')
    test.func1();
    expect(test.func2).toHaveBeenCalled();
  });

  it("#func2", function() {
    test.func2();
  });
});
