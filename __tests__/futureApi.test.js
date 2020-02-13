// Mocking Axios response
const axiosApiEdgeResponse = {
	config: {
		url: "https://some.api.com"
	},
	data: { data: ['a','b','c'] }
};

// Mocking Axios request call to an api
let mockGetRequest = jest.fn().mockImplementation(() => {
	return Promise.resolve(axiosApiEdgeResponse);
});

// Mock Axios's get method
let mockHttp = jest.mock('axios', () => {
		return {
			get: mockGetRequest
		};
	}
);

const http = require('axios');
let code = require('../futureApi');

describe('Test handler', () => {
	let spy;
	beforeEach(() => {
		spy = jest.spyOn(code, 'resolutionHandler');
	})

	afterEach(() => {
		jest.clearAllMocks();
		spy.mockRestore();
	});

	test('test', () => {
		code.run([1,2,3,4,5]);

		setTimeout(() => {
	 		expect(mockGetRequest).toHaveBeenCalledTimes(5);
			expect(resolutionHandler).toHaveBeenCalledTimes(2);
		}, 1)
	});
});