'use strict';

const http = require('axios');
const Future = require('fluture');
const sanctuary = require('sanctuary');

// We need to set up Sanctuary with Fluture types.
const {env:flutureEnv} = require('fluture-sanctuary-types');
const S = sanctuary.create ({checkTypes: true, env: sanctuary.env.concat (flutureEnv)});

// We need to define the number of calls we'll make in parallel
// and how long we should wait between requests.
const BATCH_SIZE = 3;
const WAIT = 500;

// We'll handle the returned data in this method. We'll get api errors from S.Left
// and the returned data from S.Right. If we still have ids to process, we all run again. 
const resolutionHandler = (data) => {
  // Separating promise rejections from promises resolved values
	let err = data.result.filter(e => S.isLeft(e));
	let res = data.result.filter(e => S.isRight(e));

	console.log(err, res);

	if (data.ids.length > 0) 
		run(data.ids);
};

const rejectionHandler = (error) => console.error(error.message);

// This is method is the trigger for the future. We pass the futures as argument.
// There are two ways to trigger the process, fork and forkCatch. The latter captures
// Fluture's execution errors.
const processAll = Future.forkCatch(console.log)(rejectionHandler)(resolutionHandler);

const run = (ids) => {
	let idsToProcess = ids.slice(0, BATCH_SIZE);
	let idsRemaining = ids.slice(BATCH_SIZE);

    // We pack all the futures into an array so we can execute them in parallel
	let promises = idsToProcess.map((id) => {
		let fPromise = Future.attemptP(() => http.get(`https://jsonplaceholder.typicode.com/todos/${id}`));

		// Using S.Left allows us to capture errors and these will not get the mapping function applied
		// to them as the data is not there. Only S.Right will have maps functions applied. This allows
		// us to avoid errors when null or the wrong data is present.
		return  Future.coalesce (S.Left) (S.Right) (
										S.pipe([
											S.map(S.prop('data')),
											S.chain( Future.after(WAIT) ) // We use Future.after to delay the next request
										])(fPromise)
									);
	});

	// We initiate the process by passing our futures to our trigger function. We use Future.parallel
	// to make the equivalent of a Promise.all.
	processAll(Future.go(function* () {
		let response = yield Future.parallel(3)(promises);
		return { result: response, ids: idsRemaining };
	}))
};

module.exports = {
	run,
	resolutionHandler
};
