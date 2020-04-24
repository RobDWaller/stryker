import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { StrykerOptions } from '@stryker-mutator/api/core';

import CustomJestConfigLoader, * as defaultJestConfigLoader from '../../src/configLoaders/CustomJestConfigLoader';
import ReactScriptsJestConfigLoader, * as reactScriptsJestConfigLoader from '../../src/configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader, * as reactScriptsTSJestConfigLoader from '../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import JestOptionsEditor from '../../src/JestOptionsEditor';

describe(JestOptionsEditor.name, () => {
  let sut: JestOptionsEditor;
  let customConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsJestConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsTSJestConfigLoaderStub: ConfigLoaderStub;
  let options: StrykerOptions;

  beforeEach(() => {
    customConfigLoaderStub = sinon.createStubInstance(CustomJestConfigLoader);
    reactScriptsJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsJestConfigLoader);
    reactScriptsTSJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsTSJestConfigLoader);

    sinon.stub(defaultJestConfigLoader, 'default').returns(customConfigLoaderStub);
    sinon.stub(reactScriptsJestConfigLoader, 'default').returns(reactScriptsJestConfigLoaderStub);
    sinon.stub(reactScriptsTSJestConfigLoader, 'default').returns(reactScriptsTSJestConfigLoaderStub);

    const defaultOptions: Partial<Jest.Configuration> = {
      collectCoverage: true,
      verbose: true,
      bail: false,
      testResultsProcessor: 'someResultProcessor',
    };
    customConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsJestConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsTSJestConfigLoaderStub.loadConfig.returns(defaultOptions);

    sut = testInjector.injector.injectClass(JestOptionsEditor);
    options = factory.strykerOptions();
  });

  it('should call the defaultConfigLoader loadConfig method when no projectType is defined', () => {
    sut.edit(options);

    expect(options.jest.projectType).eq('custom');
    assert(customConfigLoaderStub.loadConfig.calledOnce, 'CustomConfigLoader loadConfig not called');
  });

  it("should call the ReactScriptsJestConfigLoader loadConfig method when 'react' is defined as projectType", () => {
    options.jest = { projectType: 'react' };

    sut.edit(options);

    assert(reactScriptsJestConfigLoaderStub.loadConfig.calledOnce, 'ReactScriptsJestConfigLoader loadConfig not called');
  });

  it("should call the ReactScriptsTSJestConfigLoader loadConfig method when 'react-ts' is defined as projectType", () => {
    options.jest = { projectType: 'react-ts' };

    sut.edit(options);

    assert(reactScriptsTSJestConfigLoaderStub.loadConfig.calledOnce, 'ReactScriptsTSJestConfigLoader loadConfig not called');
  });

  it('should override verbose, collectCoverage, testResultsProcessor, notify and bail on all loaded configs', () => {
    sut.edit(options);

    expect(options.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      notify: false,
      testResultsProcessor: undefined,
      verbose: false,
    });
  });

  it('should throw an error when an invalid projectType is defined', () => {
    const projectType = 'invalidProject';
    options.jest = { projectType };

    expect(() => sut.edit(options)).to.throw(Error, `No configLoader available for ${projectType}`);
  });
});

interface ConfigLoaderStub {
  loadConfig: sinon.SinonStub;
}