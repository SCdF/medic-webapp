var views = require('kujua-sms/views');

var results;

exports.setUp = function (callback) {
  results = [];
  emit = function(key, val) {
    results.push({
      key: key,
      val: val
    });
  };
  callback();
};

exports.tearDown = function (callback) {
  results = undefined;
  emit = undefined;
  callback();
};

exports['views exist'] = function (test) {
  test.strictEqual(typeof views.data_records_by_district, 'object');
  test.strictEqual(typeof views.data_records, 'object');
  test.strictEqual(typeof views.clinic_by_phone, 'object');
  test.strictEqual(typeof views.clinic_by_refid, 'object');
  test.strictEqual(typeof views.tasks_pending, 'object');
  test.strictEqual(typeof views.data_records_read_by_type, 'object');
  test.done();
};

exports['data_records_read_by_type map emits nothing when not data_record'] = function (test) {
  var doc = {
    type: 'facility'
  };
  views.data_records_read_by_type.map(doc);
  test.same(results.length, 0);
  test.done();
};

exports['data_records_read_by_type map emits empty dh id when no facility'] = function (test) {
  var doc = {
    type: 'data_record'
  };
  views.data_records_read_by_type.map(doc);
  test.same(results.length, 1);
  test.same(results[0].key[0], '_total');
  test.same(results[0].key[1], 'messages');
  test.same(results[0].key[2], undefined);
  test.same(results[0].val, 1);
  test.done();
};

exports['data_records_read_by_type map emits one record per task'] = function (test) {
  var doc = {
    type: 'data_record',
    tasks: [
      { 
        messages: [
         { contact: { parent: { parent: { _id: 'a', type: 'district_hospital' } } } }
        ]
      }, { 
        messages: [
         { contact: { parent: { parent: { _id: 'b', type: 'district_hospital' } } } }
        ]
      }
    ]
  };
  views.data_records_read_by_type.map(doc);
  test.same(results.length, 2);
  test.same(results[0].key[0], '_total');
  test.same(results[0].key[1], 'messages');
  test.same(results[0].key[2], 'a');
  test.same(results[0].val, 1);
  test.same(results[1].key[0], '_total');
  test.same(results[1].key[1], 'messages');
  test.same(results[1].key[2], 'b');
  test.same(results[1].val, 1);
  test.done();
};

exports['data_records_read_by_type map emits dh id'] = function (test) {
  var doc = {
    type: 'data_record',
    form: 'ZYX',
    contact: { parent: { parent: { _id: 'abc', type: 'district_hospital' } } }
  };
  views.data_records_read_by_type.map(doc);
  test.same(results.length, 1);
  test.same(results[0].key[0], '_total');
  test.same(results[0].key[1], 'forms');
  test.same(results[0].key[2], 'abc');
  test.same(results[0].val, 1);
  test.done();
};

exports['data_records_read_by_type map emits no read when empty array'] = function (test) {
  var doc = {
    type: 'data_record',
    read: []
  };
  views.data_records_read_by_type.map(doc);
  test.same(results.length, 1);
  test.same(results[0].key[0], '_total');
  test.same(results[0].key[1], 'messages');
  test.same(results[0].key[2], undefined);
  test.same(results[0].val, 1);
  test.done();
};

exports['data_records_read_by_type map emits read when populated array'] = function (test) {
  var doc = {
    type: 'data_record',
    read: ['gareth','milan','dave'],
    form: 'ZYX',
    contact: { parent: { parent: { _id: 'abc', type: 'district_hospital' } } }
  };
  views.data_records_read_by_type.map(doc);
  test.same(results.length, 4);
  test.same(results[0].key[0], '_total');
  test.same(results[0].key[1], 'forms');
  test.same(results[0].key[2], 'abc');
  test.same(results[0].val, 1);
  test.same(results[1].key[0], 'gareth');
  test.same(results[1].key[1], 'forms');
  test.same(results[1].key[2], 'abc');
  test.same(results[1].val, 1);
  test.same(results[2].key[0], 'milan');
  test.same(results[2].key[1], 'forms');
  test.same(results[2].key[2], 'abc');
  test.same(results[2].val, 1);
  test.same(results[3].key[0], 'dave');
  test.same(results[3].key[1], 'forms');
  test.same(results[3].key[2], 'abc');
  test.same(results[3].val, 1);
  test.done();
};