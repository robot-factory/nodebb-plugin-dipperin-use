'use strict';

/* globals define */

define('dipperin/utils', function () {

	var utils = {
	};

	utils.isTxHash = function (txHash) {
		return /0x[0-9a-fA-F]{64}/.test(txHash)
	}

	return utils;
});