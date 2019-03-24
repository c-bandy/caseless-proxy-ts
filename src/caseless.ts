interface Dictionary {
  [key: string]: any;
}

interface NameMap {
  [key: string]: string | number;
}

type Property = string | number | symbol;

function trackPropertyName(property: Property, nameMap: NameMap): void {
  if (typeof property === 'symbol') { throw new Error('Symbols are not supported.'); }
  const canonical = property.toString().toLowerCase();
  if (!(canonical in nameMap)) {
    nameMap[canonical] = property;
  }
}

function untrackPropertyName(property: Property, nameMap: NameMap): void {
  if (typeof property === 'symbol') { throw new Error('Symbols are not supported.'); }
  const canonical = property.toString().toLowerCase();
  delete nameMap[canonical];
}

function getActualPropertyName(property: Property, nameMap: NameMap): string | number {
  if (typeof property === 'symbol') { throw new Error('Symbols are not supported.'); }
  const canonical = property.toString().toLowerCase();
  if (canonical in nameMap) {
    return nameMap[canonical];
  } else {
    return property;
  }
}

export function caseless<T extends Dictionary>(targetObj: T = {} as T): T {
  const nameMap: NameMap = {};

  for (const property of Object.keys(targetObj)) {
    trackPropertyName(property, nameMap);
  }

  return new Proxy(targetObj, {
    get(target, property, receiver) {
      const actualProperty = getActualPropertyName(property, nameMap);
      return Reflect.get(target, actualProperty, receiver);
    },
    set(target, property, value, receiver) {
      const actualProperty = getActualPropertyName(property, nameMap);
      trackPropertyName(property, nameMap);
      return Reflect.set(target, actualProperty, value, receiver);
    },
    has(target, property) {
      const actualProperty = getActualPropertyName(property, nameMap);
      return Reflect.has(target, actualProperty);
    },
    getOwnPropertyDescriptor(target, property) {
      const actualProperty = getActualPropertyName(property, nameMap);
      return Reflect.getOwnPropertyDescriptor(target, actualProperty);
    },
    defineProperty(target, property, descriptor) {
      const actualProperty = getActualPropertyName(property, nameMap);
      trackPropertyName(property, nameMap);
      return Reflect.defineProperty(target, actualProperty, descriptor);
    },
    deleteProperty(target, property) {
      const actualProperty = getActualPropertyName(property, nameMap);
      untrackPropertyName(property, nameMap);
      return Reflect.deleteProperty(target, actualProperty);
    },
  });
}
