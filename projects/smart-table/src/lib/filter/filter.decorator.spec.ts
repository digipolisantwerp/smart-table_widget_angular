import {AbstractFilter} from './abstract-filter';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';
import {SmartTableFilter} from './filter.decorator';
import {getTestScheduler} from 'jasmine-marbles';

@SmartTableFilter()
class TestFilter extends AbstractFilter {
}

describe('Filter Decorator Test', () => {
  it('should create an instance and register form changes', () => getTestScheduler().run(helpers => {
    const instance: TestFilter = new TestFilter();
    const spy: SinonSpy = sinon.spy(instance, 'onFilter');
    instance.formControl.setValue('new value');
    helpers.flush();
    expect(spy.calledOnce).toBe(true);
  }));

  it('should not continue to emit changes when instance in destroyed', () => getTestScheduler().run(helpers => {
    const instance: TestFilter = new TestFilter();
    const spy: SinonSpy = sinon.spy(instance, 'onFilter');
    instance.ngOnDestroy();
    instance.formControl.setValue('new value');
    helpers.flush();
    expect(spy.called).toBe(false);
  }));

  it('should generate an id when creating the filter', () => {
    const instance = new TestFilter();
    expect(typeof instance.id).toBe('string');
    expect(instance.id).toBeDefined();
  });
});
