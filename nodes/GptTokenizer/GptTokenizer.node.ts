import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	encode,
	decode,
	isWithinTokenLimit
  } from 'gpt-tokenizer'

export class GptTokenizer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPT-Tokenizer',
		name: 'gptTokenizer',
		group: ['transform'],
		version: 1,
		icon: 'file:TokenIcon.svg',
		description: 'Encode / decodes BPE Tokens or check Token Limits before working with the OpenAI GPT models.',
		defaults: {
			name: 'GPT-Tokenizer',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{
						name: 'Encode',
						value: 'encode',
						description: 'Encode a string into BPE tokens. Returns an array of tokens.',
						action: 'Encode a string into BPE tokens',
					},
					{
						name: 'Decode',
						value: 'decode',
						description: 'Decode an array of BPE tokens. Returns the decoded string.',
						action: 'Decode a string into BPE tokens',
					},
					{
						name: 'Count Tokens',
						value: 'countTokens',
						description: 'Determines the amount of tokens the string produces. Returns the number of tokens.',
						action: 'Count tokens of a string',
					},
					{
						name: 'Check Token Limit',
						value: 'isWithinTokenLimit',
						description: 'Check if the string is within the provided token limit. Returns true or false.',
						action: 'Check if string is within token limit',
					},
					{
						name: 'Slice to Max Token Limit',
						value: 'sliceMatchingTokenLimit',
						description: 'Slice the string into blocks with a max token limit. Returns an array of strings.',
						action: 'Slice string into sections matching a max token limit',
					},						
				],
				default: 'encode',
			},
			{
				displayName: 'Input String',
				name: 'inputString',
				type: 'string',
				default: '',
				placeholder: '',
				required: true,
				description: 'String to process',
				displayOptions: {
					show: {
						operation: ['encode', 'countTokens', 'isWithinTokenLimit', 'sliceMatchingTokenLimit'],
					},
				},
			},
			{
				displayName: 'Max Tokens',
				name: 'maxTokens',
				type: 'number',
				default: 2048,
				placeholder: '2048',
				required: true,
				description: 'The max number of tokens to allow',
				displayOptions: {
					show: {
						operation: ['isWithinTokenLimit', 'sliceMatchingTokenLimit'],
					},
				},
			},
			{
				displayName: 'Error When Exceeding Token Limit',
				name: 'errorTokenLimit',
				type: 'boolean',
				default: false,
				placeholder: '',
				description: 'Whether to throw an error when the string exceeds the token limit',
				displayOptions: {
					show: {
						operation: ['isWithinTokenLimit'],
					},
				}
			},
			{
				displayName: 'Input Tokens',
				name: 'inputTokens',
				type: 'string',
				default: '',
				required: true,
				placeholder: '[5661,318,1337]',
				description: 'Array of BPE tokens to decode',
				displayOptions: {
					show: {
						operation: ['decode'],
					},
				},
			},
			{
				displayName: 'Destination Key',
				name: 'destinationKey',
				type: 'string',
				default: '',
				placeholder: '',
				description: 'The key to write the results to. Leave empty to use default destination keys.',
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let inputString: string;
		let inputTokens: number[];
		let maxTokens: number;
		let destinationKey: string;
		let shouldThrowErrorOnTokenLimit: boolean;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				inputString = this.getNodeParameter('inputString', itemIndex, '') as string;
				inputTokens = this.getNodeParameter('inputTokens', itemIndex, null) as number[];
				maxTokens = this.getNodeParameter('maxTokens', itemIndex, 2048) as number;
				destinationKey = this.getNodeParameter('destinationKey', itemIndex, '') as string;
				shouldThrowErrorOnTokenLimit = this.getNodeParameter('errorTokenLimit', itemIndex, false) as boolean;
				item = items[itemIndex];

				if (operation === 'encode') {
					if(typeof inputString !== 'string') throw new NodeOperationError(
						this.getNode(),
						'Input String is not a string',
						{ itemIndex: itemIndex },
					);
					if(!inputString) throw new NodeOperationError(
						this.getNode(),
						'Input String field is empty',
						{ itemIndex: itemIndex },
					);

					if(!destinationKey) destinationKey = 'tokens';
					item.json[destinationKey] = encode(inputString);
				} else if (operation == 'decode'){
					if(!destinationKey) destinationKey = 'data';
					if(!Array.isArray(inputTokens)){
						throw new NodeOperationError(
							this.getNode(),
							'Input Tokens is not an array',
							{ itemIndex: itemIndex },
						);
					} else if(inputTokens.length == 0){
						throw new NodeOperationError(
							this.getNode(),
							'Input Tokens field is empty',
							{ itemIndex: itemIndex },
						);
					} else {
						item.json[destinationKey] = decode(inputTokens);
					}
				} else if (operation == 'countTokens'){
					if(typeof inputString !== 'string') throw new NodeOperationError(
						this.getNode(),
						'Input String is not a string',
						{ itemIndex: itemIndex },
					);
					if(!inputString) throw new NodeOperationError(
						this.getNode(),
						'Input String field is empty',
						{ itemIndex: itemIndex },
					);

					if(!destinationKey) destinationKey = 'tokenCount';
					item.json[destinationKey] = encode(inputString).length;
				} else if (operation == 'isWithinTokenLimit'){
					if(typeof inputString !== 'string') throw new NodeOperationError(
						this.getNode(),
						'Input String is not a string',
						{ itemIndex: itemIndex },
					);
					if(!inputString) throw new NodeOperationError(
						this.getNode(),
						'Input String field is empty',
						{ itemIndex: itemIndex },
					);

					if(!destinationKey) destinationKey = 'isWithinTokenLimit';
					if(maxTokens <= 0){
						throw new NodeOperationError(
							this.getNode(),
							'Provide Max Tokens. (bigger then 0)',
							{ itemIndex: itemIndex },
						);
					} else if(isWithinTokenLimit(inputString, maxTokens)){
						item.json[destinationKey] = true;
					} else {
						item.json[destinationKey] = false;
						if(shouldThrowErrorOnTokenLimit){
							throw new NodeOperationError(
								this.getNode(),
								'String exceeds token limit',
								{ itemIndex: itemIndex },
							);
						}
					}
				} else if (operation == 'sliceMatchingTokenLimit'){
					if(!destinationKey) destinationKey = 'slices';
					if(typeof inputString !== 'string') throw new NodeOperationError(
						this.getNode(),
						'Input String is not a string',
						{ itemIndex: itemIndex },
					);
					if(!inputString) throw new NodeOperationError(
						this.getNode(),
						'Input String field is empty',
						{ itemIndex: itemIndex },
					);

					if(maxTokens <= 0){
						throw new NodeOperationError(
							this.getNode(),
							'Provide Max Tokens. (bigger then 0)',
							{ itemIndex: itemIndex },
						);
					} else {

						if(!isWithinTokenLimit(inputString, maxTokens)){
							
							let temporaryTokens = encode(inputString);
							let blocks = [];
							
							for(let i = 0; i < temporaryTokens.length; i+=maxTokens){
								blocks.push(decode(temporaryTokens.slice(i, i+maxTokens)));
							}
			
							item.json[destinationKey] = blocks;
						} else {
							item.json[destinationKey] = [inputString];
						}
					}

				}				

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
