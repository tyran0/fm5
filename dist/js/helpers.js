export function findNode(node, callback, limitNode=document.body) {
    if (node === limitNode) return;
    if (callback(node)) return node;
    return findNode(node.parentNode,
        callback, limitNode);
}

export function getExactParent(node, parent) {
    if (!node) return;
    const nodeParent = node.parentNode;
    return (nodeParent !== parent) ?
        getExactParent(nodeParent, parent)
        : nodeParent;
}

export function getExactChild(child, parents) {
    return [...parents].filter(
        elem => getExactParent(child, elem));
}

export const numberFunctions = {
    prettify: (input) => {
        input = (input + '').split('');
        const len = Number(input.length);

        for (let i = 0; i < len; i++) {
            const reverseIndex = [len-i-1]
            const symbol = input[reverseIndex];
            const digit = i + 1;

            const flag = (digit !== len) && (digit % 3 === 0);
            if (flag) input[reverseIndex] = ',' + symbol;
        }

        return input.join('');
    },
    unprettify: input => Number(input.replace(',', ''))
}

export function DataHandler(...nodes) {
    this.dataHolders = [];
    
    nodes.forEach(node => {
        const holder = getDatasetHolder(node);
        if (holder) this.dataHolders.push(holder);
    });

    this.addMethod = function (fName, callback) {
        this.dataHolders.forEach(holder => {
            holder[fName] = () => callback(holder);
        });
    }
}

function getDatasetHolder(node) {
    const keys = node.querySelectorAll('[data-value]');

    keys.forEach(key => {
        const attr = (key.nodeName === 'PROGRESS')
            ? 'value' : 'innerText';
        
        const fName = key.dataset.value;
        const getter = keyToMethod(fName, 'get');
        const setter = keyToMethod(fName, 'set');

        node[getter] = () => key[attr];
        node[setter] = value => key[attr] = value;
    });

    if (keys.length > 1) return node;
}

function keyToMethod(key, prefix=null) {
    if (typeof key !== 'string') return;
    
    if (prefix !== null) {
        const firstLetter = key.at(0);
        key = prefix + key.replace(firstLetter,
            firstLetter.toUpperCase());
    }

    const underscorePos = key.indexOf('_');
    if (underscorePos !== -1) {
        const pairLetterPos = underscorePos + 1; 
        const toReplace = '_' + key.at(pairLetterPos);
        const replaceWith = key.at(pairLetterPos).toUpperCase();
        return keyToMethod(key.replace(toReplace, replaceWith));
    } else return key;
}