var Calculator = (function() {
	var SIZEOF_INT = 32;
	var INT_MIN = 1 << (SIZEOF_INT - 1);
	var INT_MAX = -1 - INT_MIN;
	
	var SHOW_LEADING_ZEROS = false;
	
	// Array of conversions
	var binToHex = [], hexToBin = [];
	binToHex['0000'] = '0'; hexToBin['0'] = '0000';
	binToHex['0001'] = '1'; hexToBin['1'] = '0001';
	binToHex['0010'] = '2'; hexToBin['2'] = '0010';
	binToHex['0011'] = '3'; hexToBin['3'] = '0011';
	binToHex['0100'] = '4'; hexToBin['4'] = '0100';
	binToHex['0101'] = '5'; hexToBin['5'] = '0101';
	binToHex['0110'] = '6'; hexToBin['6'] = '0110';
	binToHex['0111'] = '7'; hexToBin['7'] = '0111';
	binToHex['1000'] = '8'; hexToBin['8'] = '1000';
	binToHex['1001'] = '9'; hexToBin['9'] = '1001';
	binToHex['1010'] = 'a'; hexToBin['a'] = '1010';
	binToHex['1011'] = 'b'; hexToBin['b'] = '1011';
	binToHex['1100'] = 'c'; hexToBin['c'] = '1100';
	binToHex['1101'] = 'd'; hexToBin['d'] = '1101';
	binToHex['1110'] = 'e'; hexToBin['e'] = '1110';
	binToHex['1111'] = 'f'; hexToBin['f'] = '1111';
	
	return {
		getIntMin() {
			return INT_MIN;
		},
		getIntMax() {
			return INT_MAX;
		},
		
		processDecNum(inputDecimalString) {
			// if empty input or only the negative sign
			if (inputDecimalString.length === 0 || inputDecimalString == '-') {
				return null;
			}
			// if there are non-numeric characters
			if (/-?.+[^\d]/.test(inputDecimalString)) {
				return null;
			}
			return inputDecimalString;
		},
		isDecNumInRange(inputDecimalString) {
			// assume not null and already processed by processDecNum()
			var decNum = parseInt(inputDecimalString);
			if (decNum > INT_MAX) {
				return 1;
			}
			else if (decNum < INT_MIN) {
				return -1;
			}
			else { 
				return 0;
			}
		},
		processBinPattern(inputBinaryString) {
			// if empty input or too long
			if (inputBinaryString.length === 0 || inputBinaryString.length > SIZEOF_INT) {
				return null;
			}
			// if there are characters other than 0 or 1
			if (/[^01]/.test(inputBinaryString)) {
				return null;
			}
			if (!SHOW_LEADING_ZEROS) {
				inputBinaryString = Calculator.trimBinLeadingZeros(inputBinaryString);
			}
			return inputBinaryString;
		},
		processHexPattern(inputHexString) {
			// if empty input
			if (inputHexString.length === 0) {
				return null;
			}
			inputHexString = inputHexString.toLowerCase();
			// if string doesn't begin with 0x
			if (inputHexString.substr(0, 2) != '0x') {
				return null;
			}
			inputHexString = inputHexString.substring(2);
			// if string is too long (over a quarter of the size of an int)
			if (inputHexString.length > SIZEOF_INT / 4) {
				return null;
			}
			// if there's non-hexadecimal characters after the 0x
			if (/[^a-f0-9]/.test(inputHexString)) {
				return null;
			}
			return inputHexString;
		},
		setShowLeadingZeros(bool) {
			if (bool === true) {
				SHOW_LEADING_ZEROS = true;
			}
			else if (bool === false) {
				SHOW_LEADING_ZEROS = false;
			}
		},
		zeroPadBinPatternStr(binPattern) {
			// place leading zeros in front of the number so it's SIZEOF_INT bits long
			var zeroPad = SIZEOF_INT - binPattern.length % SIZEOF_INT;
			if (zeroPad != SIZEOF_INT) {
				var zeroPadStr = '';
				for (var i = 0; i < zeroPad; i++) {
					zeroPadStr += '0';
				}
				binPattern = zeroPadStr + binPattern;
			}
			return binPattern;
		},
		trimBinLeadingZeros(binPattern) {
			var firstOne = binPattern.indexOf('1');
			if (firstOne === -1) {
				return '0';
			}
			return binPattern.substring(firstOne);
		},
		decNumToBinPattern(decimalNumberString) {
			if (decimalNumberString === 0) {
				return '0';
			}
			var numBits = SIZEOF_INT;
			// loop through bits and apply AND operator
			var bit = 1 << (numBits - 1);
			var bitString = "";
			for (var i = 0; i < numBits; i++) {
				bitString += (decimalNumberString & bit) ? "1" : "0";
				bit >>>= 1;
			}
			if (!SHOW_LEADING_ZEROS) {
				bitString = Calculator.trimBinLeadingZeros(bitString);
			}
			return bitString;
		},
		binPatternToDecNum(binPattern) {
			binPattern = Calculator.zeroPadBinPatternStr(binPattern);
			// binPattern should be SIZEOF_INT bits now
			var decNum = 0;
			for (var i = 0; i < SIZEOF_INT; i++) {
				var bit = parseInt(binPattern[i]);
				if (bit === 1) {
					decNum += 1 << (SIZEOF_INT - i - 1);
				}
			}
			return decNum;
		},
		binPatternToHexPattern(binPattern) {
			binPattern = Calculator.zeroPadBinPatternStr(binPattern);
			var hexStr = '';
			for (var i = 0; i < binPattern.length; i += 4) {
				var byteStr = binPattern.substr(i, 4);
				hexStr += binToHex[byteStr];
			}
			if (!SHOW_LEADING_ZEROS) {
				if (/[^0]/.test(hexStr)) {
					// if at least one non-zero character, i.e., the number isn't 0
					var firstNonZero;
					for (firstNonZero = 0; firstNonZero < hexStr.length; firstNonZero++) {
						if (hexStr[firstNonZero] != '0') {
							break;
						}
					}
					hexStr = hexStr.substring(firstNonZero);
				}
				else {
					hexStr = '0';
				}
			}
			hexStr = '0x' + hexStr;
			return hexStr;
		},
		hexPatternToBinPattern(hexPattern) {
			var binPattern = '';
			for (var i = 0; i < hexPattern.length; i++) {
				binPattern += hexToBin[hexPattern[i]];
			}
			if (!SHOW_LEADING_ZEROS) {
				binPattern = Calculator.trimBinLeadingZeros(binPattern);
			}
			return binPattern;
		}
	};
})();