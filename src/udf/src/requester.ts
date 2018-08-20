import { RequestParams, UdfResponse, UdfErrorResponse, logMessage } from './helpers';
import { FFWAPI } from './firefly';

export class Requester {
	private _headers: HeadersInit | undefined;

	public constructor(headers?: HeadersInit) {
		if (headers) {
			this._headers = headers;
		}
		
	}

	public sendRequest<T extends UdfResponse>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T | UdfErrorResponse>;
	public sendRequest<T>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T>;
	public sendRequest<T>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T> {
		// if (params !== undefined) {
		// 	const paramKeys = Object.keys(params);
		// 	if (paramKeys.length !== 0) {
		// 		urlPath += '?';
		// 	}

		// 	urlPath += paramKeys.map((key: string) => {
		// 		return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
		// 	}).join('&');
		// }

		logMessage('New request: ' + urlPath);
		console.log('---------------------dddddddddddddddddddd---------------')
		console.log(datafeedUrl)
		console.log(urlPath)
		console.log(params)

		// Send user cookies if the URL is on the same origin as the calling script.
		// const options: RequestInit = { credentials: 'same-origin' };

		// if (this._headers !== undefined) {
		// 	options.headers = this._headers;
		// }
		let service = new FFWAPI(datafeedUrl, params);
		return service.handle(urlPath);

		// return fetch(`${datafeedUrl}/${urlPath}`, options)
		// 	.then((response: Response) => response.text())
		// 	.then((responseTest: string) => JSON.parse(responseTest));
		//自定义业务
		/**
			 /config返回配置信息，
			 {
					supports_search: false,
					supports_group_request: true,
					supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
					supports_marks: false,
					supports_time: false
				},
				/symbol_info?group=<group_name>  商品集合信息

				商品解析
				/symbols?symbol=<symbol>
				https://b.aitrade.ga/books/tradingview/book/Symbology.html#symbolinfo-structure


				K线柱
				GET /history?symbol=<ticker_name>&from=<unix_timestamp>&to=<unix_timestamp>&resolution=<resolution>
				例:GET /history?symbol=BEAM~0&resolution=D&from=1386493512&to=1395133512
				Response: 响应的预期是一个对象，下面列出了一些属性。每个属性都被视为表的列，如上所述。
					s: 状态码。 预期值:ok|error|no_data
					errmsg: 错误消息。只在s = 'error'时出现
					t: K线时间. unix时间戳 (UTC)
					c: 收盘价
					o: 开盘价 (可选)
					h: 最高价 (可选)
					l: 最低价(可选)
					v: 成交量 (可选)
					nextTime: 下一个K线柱的时间 如果在请求期间无数据 (状态码为no_data) (可选)

					标识
					GET /marks?symbol=<ticker_name>&from=<unix_timestamp>&to=<unix_timestamp>&resolution=<resolution>
					Response: 响应预期是一个对象，下面列出了一些属性。此对象与JS API中的respective response相似，但每个属性都被视为表的列，如上所述。

					{
							id: [array of ids],
							time: [array of times],
							color: [array of colors],
							text: [array of texts],
							label: [array of labels],
							labelFontColor: [array of label font colors],
							minSize: [array of minSizes],
					}
					//时间刻度标记
					报价
						Request:GET /quotes?symbols=<ticker_name_1>,<ticker_name_2>,...,<ticker_name_n>

						Example:GET /quotes?symbols=NYSE%3AAA%2CNYSE%3AF%2CNasdaqNM%3AAAPL
						s: status code for request. Expected values:ok|error
						errmsg: error message for client
						d:symbols data array
		  
		  
		 **/

	}
}
