'use strict';

import { describe, it } from "mocha";
import { expect } from "chai";
import { GinkgoNode } from './outliner';
import * as specExecutor from './specExecutor';

const buildEmptyGinkgoNode = function () : GinkgoNode {
    return {
        name: '',
        text: '',
        start: 0,
        end: 0,
        spec: false,
        focused: false,
        pending: false,
        nodes: [],
        parent: undefined,
    };
};

describe('specExecutor.getFullSpecText', function () {
    let rootNode: GinkgoNode;
    let node2: GinkgoNode;
    let node3: GinkgoNode;
    let node4: GinkgoNode;

    beforeEach(function () {
        rootNode = buildEmptyGinkgoNode();
        rootNode.name = 'Describe';
        rootNode.text = 'MyClass';

        node2 = buildEmptyGinkgoNode();
        node2.name = 'Context';
        node2.text = 'Creating a new stuff';
        node2.parent = rootNode;

        node3 = buildEmptyGinkgoNode();
        node3.name = 'When';
        node3.text = 'Have a some data';
        node3.parent = node2;

        node4 = buildEmptyGinkgoNode();
        node4.name = 'It';
        node4.text = 'should return success';
        node4.parent = node3;
    });

    context("when we have 4 nested nodes", function () {
        it('should return the text to the last node properly', function () {
            const result = specExecutor.getFullSpecText(node4);
            expect(result).to.equal("MyClass Creating a new stuff when Have a some data should return success");
        });

        it('should return the text to the 3th node properly', function () {
            const result = specExecutor.getFullSpecText(node3);
            expect(result).to.equal("MyClass Creating a new stuff when Have a some data");
        });

        it('should return the text to the 2th node properly', function () {
            const result = specExecutor.getFullSpecText(node2);
            expect(result).to.equal("MyClass Creating a new stuff");
        });

        it('should return the text to the root node properly', function () {
            const result = specExecutor.getFullSpecText(rootNode);
            expect(result).to.equal("MyClass");
        });
    });

    context("when we have name variants for 'When'", function () {
        it("should return the text properly for 'FWhen'", function () {
            node3.name = 'FWhen';
            const result = specExecutor.getFullSpecText(node4);
            expect(result).to.equal("MyClass Creating a new stuff when Have a some data should return success");
        });

        it("should return the text properly for 'PWhen'", function () {
            node3.name = 'PWhen';
            const result = specExecutor.getFullSpecText(node4);
            expect(result).to.equal("MyClass Creating a new stuff when Have a some data should return success");
        });
    });
});