(() => {
  // primitiveExtensions.ts
  Object.defineProperty(Number.prototype, "round", {
    value: function(decimals = 0) {
      const factor = Math.pow(10, decimals);
      return Math.round(this * factor) / factor;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Number.prototype, "prettyPrice", {
    value: function() {
      const price = Math.round(this * 100) / 100;
      return Number.isInteger(price) ? price.toString() : price.toFixed(2);
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(String.prototype, "round", {
    value: function(decimals = 0) {
      const floatNumber = parseFloat(this);
      if (Number.isNaN(floatNumber))
        throw new Error(`String "${this}" can not be parsed into a float`);
      return floatNumber.round(decimals);
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(String.prototype, "prettyPrice", {
    value: function() {
      const floatNumber = parseFloat(this);
      if (Number.isNaN(floatNumber))
        throw new Error(`String "${this}" can not be parsed into a float`);
      return floatNumber.prettyPrice();
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(String.prototype, "upperCaseFirst", {
    value: function() {
      return this.length == 0 ? "" : this[0].toUpperCase() + this.slice(1);
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(String.prototype, "prettyUpperCase", {
    value: function(minLengthToUpperCaseFirst = 4) {
      return this.toLowerCase().upperCaseFirst().split(" ").map((w) => w.length < minLengthToUpperCaseFirst ? w : w.upperCaseFirst()).join(" ");
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "isEmpty", {
    value: function() {
      return this.length == 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "any", {
    value: function() {
      return this.length > 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "first", {
    value: function() {
      if (this.isEmpty()) {
        console.warn("first() called on an empty array, returning undefined");
      }
      return this[0];
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "last", {
    value: function() {
      if (this.isEmpty()) {
        console.warn("last() called on an empty array, returning undefined");
      }
      return this[this.length - 1];
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "shuffle", {
    value: function() {
      let currentIndex = this.length;
      let randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        (currentIndex--)[this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
      }
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "getDuplicates", {
    value: function(predicate) {
      const fn = predicate ?? ((item) => item);
      return this.filter((element_a, index_a) => {
        return index_a != this.findIndex((element_b) => {
          return fn(element_a) == fn(element_b);
        });
      });
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "removeDuplicates", {
    value: function(predicate) {
      const fn = predicate ?? ((item) => item);
      return this.filter((element_a, index_a) => {
        return index_a == this.findIndex((element_b) => {
          return fn(element_a) == fn(element_b);
        });
      });
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "removeIndex", {
    value: function(indexToRemove) {
      if (indexToRemove < 0 || this.length <= indexToRemove) {
        console.warn(`IndexToRemove: [${indexToRemove}] out of range. Array has ${this.length} elements`);
      }
      return this.filter((_, index) => index != indexToRemove);
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "removeOne", {
    value: function(predicate) {
      return this.removeIndex(this.findIndex(predicate));
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "removeAll", {
    value: function(predicate) {
      return this.filter((item, index) => !predicate(item, index));
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "groupBy", {
    value: function(predicate) {
      const groups = {};
      this.forEach((item, index) => {
        let key = predicate(item, index);
        if (!groups[key]) {
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
  Object.defineProperty(Array.prototype, "sum", {
    value: function(predicate, initialValue = 0) {
      if (this.isEmpty())
        return initialValue;
      if (!predicate && typeof this[0] !== "number")
        throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0]);
      const fn = predicate ?? ((item) => item);
      return this.reduce((total, item, index) => {
        return total + fn(item, index);
      }, initialValue);
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "max", {
    value: function(predicate) {
      if (this.isEmpty()) {
        console.warn("max() called on an empty array, returning undefined");
        return void 0;
      }
      if (!predicate && typeof this[0] !== "number")
        throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0]);
      const fn = predicate ?? ((item) => item);
      let maxValue = -Infinity;
      let maxElement;
      this.forEach((item, index) => {
        const value = fn(item, index);
        if (value > maxValue) {
          maxValue = value;
          maxElement = item;
        }
      });
      return maxElement;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(Array.prototype, "min", {
    value: function(predicate) {
      if (this.isEmpty()) {
        console.warn("min() called on an empty array, returning undefined");
        return void 0;
      }
      if (!predicate && typeof this[0] !== "number")
        throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0]);
      const fn = predicate ?? ((item) => item);
      let minValue = Infinity;
      let minElement;
      this.forEach((item, index) => {
        const value = fn(item, index);
        if (value < minValue) {
          minValue = value;
          minElement = item;
        }
      });
      return minElement;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
