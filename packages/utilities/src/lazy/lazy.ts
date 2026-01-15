export class Lazy<T> {
	private instance: T | undefined;

	public constructor(private readonly factory: () => T) {}

	public get(): T {
		let instance = this.instance;

		if (!instance) {
			instance = this.factory();
		}

		return instance;
	}
}
