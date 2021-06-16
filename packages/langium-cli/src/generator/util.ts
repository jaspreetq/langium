/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { readFileSync } from 'fs';
import { CompositeGeneratorNode, GeneratorNode, NL } from 'langium';
import path from 'path';

function getLangiumCliVersion(): string {
    const ownPackagePath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = readFileSync(ownPackagePath).toString();
    const pack = JSON.parse(packageJson);
    return pack.version;
}

function getGeneratedHeader(): GeneratorNode {
    const node = new CompositeGeneratorNode();
    node.children.push(
        '/******************************************************************************', NL,
        ` * This file was generated by langium-cli ${cliVersion}.`, NL,
        ' * DO NOT EDIT MANUALLY!', NL,
        ' ******************************************************************************/', NL, NL
    );
    return node;
}

export const cliVersion = getLangiumCliVersion();
export const generatedHeader = getGeneratedHeader();