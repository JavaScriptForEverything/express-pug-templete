

// { name: 'riajul', email: 'abc@com' }, ['name'] => { name: 'riajul' }
exports.filterObjectByArray = (filterObject, allowedFields) => {
	const tempObj = {}

	Object.entries(filterObject).forEach(([key, value]) => {
		if( allowedFields.includes(key) ) {
			tempObj[key] = value
		}
	})

	return tempObj
}
