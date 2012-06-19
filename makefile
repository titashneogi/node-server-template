# usage:  make test

REPORTER=spec
MOCHA_COMMAND = @NODE_ENV=test \
	mocha \
	--ui bdd \
	--reporter $(REPORTER) \
	--ignore-leaks \
	--timeout 6000

all:
	$(MOCHA_COMMAND) ./test/app/**/*.test.js
