export function assert(object, type) {
    if (!object) return false;

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