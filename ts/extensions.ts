/*************************************************************
* Build command: $tsc && sed -i '1,5d' ../js/extensions.js   *
* The second part is to delete this 5 lines comment          *
* Output will go to "./tsconfig.json".compilerOptions.outDir *
**************************************************************/

// Number ---------------------------------------
Object.defineProperty(Number.prototype, 'round', {
    value: function(this: number, decimals: number = 0): number {
        const factor = Math.pow(10, decimals);
        return Math.round(this * factor) / factor;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(Number.prototype, 'prettyPrice', {
    value: function(this: number): string {
        const price = Math.round(this*100)/100;
        return Number.isInteger(price) ? price.toString() : price.toFixed(2);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// String ---------------------------------------
Object.defineProperty(String.prototype, 'round', { 
    value: function(this: string, decimals: number = 0): number {
        const floatNumber = parseFloat(this);
        if (Number.isNaN(floatNumber))
            throw new Error(`String "${this}" can not be parsed into a float`);
        return floatNumber.round(decimals);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(String.prototype, 'prettyPrice', { 
    value: function(this: string): string {
        const floatNumber = parseFloat(this);
        if (Number.isNaN(floatNumber))
            throw new Error(`String "${this}" can not be parsed into a float`);
        return floatNumber.prettyPrice();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(String.prototype, 'upperCaseFirst', {
    value: function(this: string): string {
        return this.length == 0 ? ''
            : this[0].toUpperCase() + this.slice(1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(String.prototype, 'prettyUpperCase', {
    value: function(this: string, minLengthToUpperCaseFirst: number = 4): string {
        return this
            .toLowerCase()
            .upperCaseFirst()
            .split(' ')
            .map(w => w.length < minLengthToUpperCaseFirst ? w : w.upperCaseFirst())
            .join(' ');
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// Array ----------------------------------------
Object.defineProperty(Array.prototype, 'isEmpty', {
    value: function<T>(this: T[]) {
        return this.length == 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'any', {
    value: function<T>(this: T[]) {
        return this.length > 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'first', {
    value: function<T>(this: T[]): T | undefined {
        if (this.isEmpty()) {
            console.warn("first() called on an empty array, returning undefined")
        }
        return this[0];
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'last', {
    value: function<T>(this: T[]): T | undefined {
        if (this.isEmpty()) {
            console.warn("last() called on an empty array, returning undefined");
        }
        return this[this.length -1];
    },
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(Array.prototype, 'shuffle', {
    value: function<T>(this: T[]): void {
        let currentIndex = this.length
        let randomIndex
    
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
        
            // And swap it with the current element.
            [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]]
        }
    },
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(Array.prototype, 'getDuplicates', {
    value: function<T, TKey = T>(this: T[], predicate?: (item: T) => TKey): T[] {
        const fn = predicate ?? ((item: T) => item as unknown as TKey);
        return this.filter((element_a, index_a) => {
            return index_a != this.findIndex(element_b => {
                return fn(element_a) == fn(element_b)
            });
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'removeDuplicates', {
    value: function<T, TKey = T>(this: T[], predicate?: (item: T) => TKey): T[] {
        const fn = predicate ?? ((item: T) => item as unknown as TKey);
        return this.filter((element_a, index_a) => {
            return index_a == this.findIndex(element_b => {
                return fn(element_a) == fn(element_b)
            });
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'removeIndex', {
    value: function<T>(this: T[], indexToRemove: number): T[] {
        if (indexToRemove < 0 || this.length <= indexToRemove) {
            console.warn(`IndexToRemove: [${indexToRemove}] out of range. Array has ${this.length} elements`);
        }
        return this.filter((_, index) => index != indexToRemove);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'removeOne', {
    value: function<T>(this: T[], predicate: (item: T, index: number) => boolean): T[] {
        return this.removeIndex(this.findIndex(predicate));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'removeAll', {
    value: function<T>(this: T[], predicate: (item: T, index: number) => boolean): T[] {
        return this.filter((item, index) => !predicate(item, index));
    },
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(Array.prototype, 'groupBy', {
    value: function<T>(this: T[], predicate: (item: T, index: number) => string): Record<string, T[]> {
        const groups: Record<string, T[]> = {};

        this.forEach((item, index) => {
            let key = predicate(item, index);
            if(!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        return groups;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(Array.prototype, 'sum', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number, initialValue: number = 0): number {
        if (this.isEmpty())
            return initialValue;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");

        const fn = predicate ?? ((item: T) => item as number);

        return this.reduce((total, item, index) => {
            return total + fn(item, index);
        }, initialValue);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'max', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined {
        if (this.isEmpty()) {
            console.warn("max() called on an empty array, returning undefined");
            return undefined;
        }
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T) => item as number);
        let maxValue: number = -Infinity;
        let maxElement: T;

        this.forEach((item, index) => {
            const value = fn(item, index)
            if(value > maxValue) {
                maxValue = value
                maxElement = item
            }
        });

        return maxElement!;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
Object.defineProperty(Array.prototype, 'min', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined {
        if (this.isEmpty()) {
            console.warn("min() called on an empty array, returning undefined");
            return undefined;
        }
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T) => item as number);
        let minValue: number = Infinity;
        let minElement: T;

        this.forEach((item, index) => {
            const value = fn(item, index)
            if(value < minValue) {
                minValue = value
                minElement = item
            }
        });

        return minElement!;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
