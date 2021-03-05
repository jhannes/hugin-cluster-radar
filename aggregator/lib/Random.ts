export class Random {
  constructor(private seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed;
  }

  nextInt(limit: number) {
    return this.next() % limit;
  }

  pickOne<T>(options: T[]): T {
    return options[this.nextInt(options.length)];
  }

  randomChars(length: number): string {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      result += characters.charAt(this.nextInt(characters.length));
    }
    return result;
  }

  randomPastDateTime(now: Date = new Date()): Date {
    return new Date(now.getTime() - this.nextInt(4 * 7 * 24 * 60 * 60 * 1000));
  }
}
