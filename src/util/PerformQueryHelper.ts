export default class QueryHelper {

	public getKeysHelper(obj: unknown): string[] {
		let keys = [];
		for (const i in obj as any) {
			keys.push(i);
		}
		return keys;
	}

	public validateApplyKey(key: string): boolean {
		const validateApplyKeyyRegex = new RegExp("^([^_]+)$");
		return validateApplyKeyyRegex.test(key);
	}

	public validateSectionsSKey(key: string): boolean {
		const validateSKeyRegex = new RegExp
		("^([^_]+_((dept)|(id)|(instructor)|(title)|(uuid)))$");
		return validateSKeyRegex.test(key);
	}

	public validateSectionsMKey(key: string): boolean {
		const validateMKeyRegex = new RegExp("^([^_]+_((avg)|(pass)|(fail)|(audit)|(year)))$");
		return validateMKeyRegex.test(key);
	}

	public validateRoomsSKey(key: string): boolean {
		const validateSKeyRegex = new RegExp
		("^([^_]+_((fullname)|(shortname)|(number)|(name)|(address)|(type)|(furniture)|(href)))$");
		return validateSKeyRegex.test(key);
	}

	public validateRoomsMKey(key: string): boolean {
		const validateMKeyRegex = new RegExp("^([^_]+_((lat)|(lon)|(seats)))$");
		return validateMKeyRegex.test(key);
	}

	public validateMSKey(key: string): boolean {
		return this.validateSectionsSKey(key) ||
			this.validateSectionsMKey(key) ||
			this.validateRoomsMKey(key) || this.validateRoomsSKey(key);
	}

	public extractFieldIDString(str: string): [string,string] {
		let l = str.length;
		let id: string = "";
		let field: string = "";
		let seen: boolean = false;
		for (let i = 0; i < l; i++) {
			if (seen === true) {
				field = field + str[i];
			} else if (str[i] === "_") {
				seen = true;
			} else if (seen === false) {
				id = id + str[i];
			}
		}
		return [id, field];
	}

}
