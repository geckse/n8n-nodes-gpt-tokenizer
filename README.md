![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# Work with BPE Tokens in n8n with the GPT-Tokenizer Node

This community package contains a node to work with BPE Tokens such as OpenAI's GPT models use under the hood. As a matter of fact this node works just fine with the OpenAI Node.

You can:
* Encode a string into BPE Tokens (may be cool for custom training)
* Decode an array of BPE Tokens back to a string (for funzies?)
* Determine a strings token length before submitting to the OpenAI API
* Calculate costs before submitting to OpenAI API
* Split a text into chunks which match exactly a definable Token Limit

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Supported Operations](#supported-operations)  
[Installation](#installation)  
[Compatibility](#compatibility)  
[About](#about)  
[Version History](#version-history)  

## Supported Operations

| Operation  | Description | Options |
| ------------- |  ------------- |  ------------- | 
| Encode  | Encode a string into BPE Tokens. Returns an array of Tokens. | - |
| Decode  | Decode an array of BPE Tokens into a string. Returns a string. | - |
| Count Tokens  | Count the tokens a string produces. Return the number of tokens. | - |
| Check Token Limit  | Wheather a given string exceeds a defined Token Limit. Returns a boolean. | Optional: throw an error if the Token Limit is exceeded. |
| Slice to Max Token Limit  | Slice the string into block which match exactly the provided token limit. Returns an array of strings. | - |

## Installation
Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.
It also should automatically install this depency: https://www.npmjs.com/package/gpt-tokenizer, which is a port of the original BPE Token Python Library.

## Compatibility

The Latest Version of n8n. If you encounter any problem, feel free to [open an issue](https://github.com/geckse/n8n-nodes-gpt-tokenizer) on Github. 

## About

<img src="https://let-the-work-flow.com/content/uploads/logo-let-the-work-flow-signet-quad-150x150.png" align="left" height="74" width="74"> 
<br>
Hi I'm geckse and I let your work flow! 👋 
I hope you are enjoying these nodes. If you are in need of a smooth automation, steady integration or custom code check my page: https://let-the-work-flow.com

## Version History

### 0.1.1
- just polishing the npm release

### 0.1.0
- initial release
