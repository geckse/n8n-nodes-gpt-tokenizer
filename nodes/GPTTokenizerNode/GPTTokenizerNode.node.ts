import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	encode
  } from 'gpt-tokenizer'

export class GPTTokenizerNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPT-Tokenizer',
		name: 'gptTokenizer',
		group: ['transform'],
		version: 1,
		icon: 'fa:hashtag',
		description: 'Transforms text into Tokens like GPT',
		defaults: {
			name: 'GPT-Tokenizer',
			color: '#9d34da'
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Input String',
				name: 'inputString',
				type: 'string',
				default: '',
				placeholder: 'Something to tokenize',
				description: 'Enter the string to be tokenized',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let inputString: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				inputString = this.getNodeParameter('inputString', itemIndex, '') as string;
				item = items[itemIndex];

				item.json['inputString'] = encode(inputString);
			} catch (error) {

				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return this.prepareOutputData(items);
	}
}
