
// We'll mock the console and change its implementation to avoid printing logs during tests
const consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(d => null); 
const consoleWarnSpy = jest.spyOn(global.console, 'warn').mockImplementation(d => null); 
const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation(d => null); 

// Mocking Axios response
const axiosApiEdgeResponse = {
	config: { url: "https://some.api.com" },
	data: { data: ['a','b','c'] }
};

// Mocking Axios request call to an api
let mockGetRequest = jest.fn();

// Mock Axios's get method
let mockHttp = jest.mock('axios', () => {
		return {
			get: mockGetRequest
		};
	}
);

process.env.BATCH_SIZE = Number(3)
process.env.WAIT = Number(1);

const mockHandler = jest.fn();
let exec = require('../futureApi');
const http = require('axios');

describe('Test handler', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	test('test it returns and parses records printing api records with console log', (done) => {
		mockGetRequest.mockImplementation(() => Promise.resolve(axiosApiEdgeResponse));

		exec([1,2,3,4,5]);

		setTimeout(() => {
	 		expect(mockGetRequest).toHaveBeenCalledTimes(5);
	 		expect(consoleLogSpy).toHaveBeenCalledTimes(2);
			done()
		}, 50)
	},50);

	test('test it returns and parses records printing api errors as console warn', (done) => {
		mockGetRequest.mockImplementation(() => Promise.reject({
				config: { url: "https://some.api.com" },
				statusCode: 404,
				statusText: 'Record does not exist'
		}));

		exec([1,2,3,4,5]);

		setTimeout(() => {
	 		expect(mockGetRequest).toHaveBeenCalledTimes(5);
	 		expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
			done()
		}, 50)
	},50);

	test('test it returns console error when something breaks', (done) => {
		mockGetRequest.mockImplementation(() => Promise.resolve(Error('This broke!')));

		exec([1,2,3,4,5]);

		setTimeout(() => {
	 		expect(mockGetRequest).toHaveBeenCalledTimes(3);
	 		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			done()
		}, 50)
	},50);
});