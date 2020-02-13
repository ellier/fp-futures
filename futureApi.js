'use strict';

const http = require('axios');
const Future = require('fluture');

const sanctuary = require('sanctuary');
const {env:flutureEnv} = require('fluture-sanctuary-types');
const S = sanctuary.create ({checkTypes: true, env: sanctuary.env.concat (flutureEnv)});

const BATCH_SIZE = 3;
const WAIT = 1500;

const resolutionHandler = (data) => {
  // Separating promise rejections from promises resolved values
	let err = data.result.filter(e => S.isLeft(e));
	let res = data.result.filter(e => S.isRight(e));

	if (data.ids.length > 0) 
		run(data.ids);
};

const rejectionHandler = (error) => console.error(error.message);

const processAll = Future.forkCatch(console.log)(rejectionHandler)(resolutionHandler);

const run = (ids) => {
	let idsToProcess = ids.slice(0, BATCH_SIZE);
	let idsRemaining = ids.slice(BATCH_SIZE);

	let promises = idsToProcess.map((id) => {
		let fPromise = Future.attemptP(() => http.get(`https://jsonplaceholder.typicode.com/todos/${id}`));

		return  Future.coalesce (S.Left) (S.Right) (
										S.pipe([
											S.map(e => e.data),
											S.chain( Future.after(WAIT) )
										])(fPromise)
									);
	});

	processAll(Future.go(function* () {
		let response = yield Future.parallel(3)(promises);
		return { result: response, ids: idsRemaining };
	}))
};

module.exports = {
	run,
	resolutionHandler
};
