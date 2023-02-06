export function keyToMethod(key) {
    if (typeof key !== 'string') return;
    
    const firstLetter = key.at(0);
    if (firstLetter !== firstLetter.toUpperCase()) {
        key = key.replace(firstLetter, firstLetter.toUpperCase());
    }

    const underscorePos = key.indexOf('_');
    if (underscorePos !== -1) {
        const pairLetterPos = underscorePos + 1; 
        const toReplace = '_' + key.at(pairLetterPos);
        const replaceWith = key.at(pairLetterPos).toUpperCase();
        const tempKey = key.replace(toReplace, replaceWith);
        key = keyToMethod(tempKey);
    }

    return key;
}

export default function PrettyNumber() {
    this.prettify = function(input) {
        const output = '1,024';
        return output;
    }
    this.unprettify = function(input) {
        const output = Number(input.replace(',', ''));
        return output;
    }
}

export function assert(object, type) {
    if (!object) return;

    const isFunction = (typeof object === 'function');
    const isPrimitive = !(object instanceof Object);
    const expression = (isPrimitive || isFunction)
        ? (typeof object === type)
        : (object instanceof type);

    console.assert(expression, '%o', { object, type });
    return expression;
}

export function isButton(node) {
    if (node.tagName === 'BUTTON') return node;
    return (node.parentNode.tagName === 'BUTTON')
        ? node.parentNode : null;
}