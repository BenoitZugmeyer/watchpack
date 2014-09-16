var should = require("should");
var path = require("path");
var TestHelper = require("./helpers/TestHelper");
var Watchpack = require("../lib/Watchpack");

var fixtures = path.join(__dirname, "fixtures");
var testHelper = new TestHelper(fixtures);

describe("Watchpack", function() {
	this.timeout(5000);
	beforeEach(testHelper.before);
	afterEach(testHelper.after);
	
	it("should watch a single file", function(done) {
		var w = new Watchpack({
			aggregateTimeout: 1000
		});
		var changeEvents = 0;
		w.on("change", function(file, mtime) {
			file.should.be.eql(path.join(fixtures, "a"));
			changeEvents++;
		});
		w.on("aggregated", function(changes) {
			changes.should.be.eql([path.join(fixtures, "a")]);
			changeEvents.should.be.eql(1);
			w.close();
			done();
		});
		w.watch([path.join(fixtures, "a")], []);
		testHelper.tick(function() {
			testHelper.file("a");
		});
	});
	
	it("should watch multiple files", function(done) {
		var w = new Watchpack({
			aggregateTimeout: 1000
		});
		var changeEvents = [];
		w.on("change", function(file, mtime) {
			if(changeEvents[changeEvents.length-1] === file)
				return;
			changeEvents.push(file);
		});
		w.on("aggregated", function(changes) {
			changes.should.be.eql([path.join(fixtures, "a"), path.join(fixtures, "b")]);
			changeEvents.should.be.eql([
				path.join(fixtures, "a"),
				path.join(fixtures, "b"),
				path.join(fixtures, "a"),
				path.join(fixtures, "b"),
				path.join(fixtures, "a")
			]);
			w.close();
			done();
		});
		w.watch([path.join(fixtures, "a"), path.join(fixtures, "b")], []);
		testHelper.tick(function() {
			testHelper.file("a");
			testHelper.tick(function() {
				testHelper.file("b");
				testHelper.tick(function() {
					testHelper.file("a");
					testHelper.tick(function() {
						testHelper.file("b");
						testHelper.tick(function() {
							testHelper.file("a");
						});
					});
				});
			});
		});
	});
	
	it("should watch a directory", function(done) {
		var w = new Watchpack({
			aggregateTimeout: 1000
		});
		var changeEvents = [];
		w.on("change", function(file, mtime) {
			if(changeEvents[changeEvents.length-1] === file)
				return;
			changeEvents.push(file);
		});
		w.on("aggregated", function(changes) {
			changes.should.be.eql([path.join(fixtures, "dir")]);
			changeEvents.should.be.eql([path.join(fixtures, "dir", "a")]);
			w.close();
			done();
		});
		testHelper.dir("dir");
		testHelper.tick(function() {
			w.watch([], [path.join(fixtures, "dir")]);
			testHelper.tick(function() {
				testHelper.file(path.join("dir", "a"));
			});
		});
	});
});
