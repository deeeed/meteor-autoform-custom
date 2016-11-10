Template.afFormArrayWrapper.onCreated(function () {
    //if(!this.data.name || !this.data.doc || !this.data.collection) {
    //    var error = "missing mandatory data 'name' or 'doc' or 'collection'";
    //    console.error(error);
    //    throw new Error("Invalid data context",error);
    //}

    var self = this;
    this.autorun(function () {
        var data = Template.currentData();

        // console.debug("autorun created with data", data);

        var fields = self.data.fields;
        if (_.isString(fields)) {
            fields = fields.split(",");
        }

        var context = data.doc[data.scope] || [];
        var type = "update";

        // Currently selected experience, none (null) is selected by default.
        self.fields = new ReactiveVar(fields);
        self.selected = new ReactiveVar(null);
        self.context = new ReactiveVar(context);
        self.form_type = new ReactiveVar(type);
        self.form_scope = new ReactiveVar(data.scope);
        self.form_setArrayItems = new ReactiveVar(true);
    });
});

Template.afFormArrayWrapper.onRendered(function () {
    var data = this.data;
    var context = data.doc[data.scope] || [];
    if (context.length == 0) {
        // Simulate click if no data
        this.$("button.btn-new").click();
    }

    // console.debug("rendering FormArrayWrapper", this);
});

Template.afFormArrayWrapper.helpers({
    form_config: function () {
        var tpl = Template.instance();
        var type = tpl.form_type.get();
        var setArrayItems = tpl.form_setArrayItems.get();
        var scope = tpl.form_scope.get();
        var data = tpl.data;

        var config = {
            "type": type,
            "collection": data.collection,
            "doc": data.doc,
            "setArrayItems": setArrayItems,
            "scope": scope
        };
        //console.debug("form config",config,tpl);

        return config;
    },
    context: function () {
        var context = Template.instance().context.get();
        //console.debug("context is",context);
        return context;
    },
    hasSelection: function () {
        var selection = Template.instance().selected.get();
        var form_type = Template.instance().form_type.get();
        return selection != null || form_type == "update-pushArray";
    },
    selectedIndex: function () {
        return Template.instance().selected.get();
    },
    selectFields: function () {
        var fields = Template.instance().fields.get() || [];
        //console.debug("fields are",fields);
        return fields;
    },
    fieldValue: function (field, index) {
        var context = Template.instance().context.get();
        if (_.isArray(context) && context.length > index) {
            var value = context[index][field];
            if (!value) {
                // Maybe the field has '.' hierarchy 'element.child'
                // Parse the field value and iterate through each sub value.
                value = context[index];
                var fields = field.split('.');
                _.forEach(fields, function (f) {
                    //console.debug("value is ",value);
                    value = value[f];
                });
            }
            return value;
        }
        return "INVALID field [" + index + "] " + field;
    }
});

Template.afFormArrayWrapper.events({
    "click td.td-item": function (evt, tpl) {
        evt.preventDefault();
        var index = $(evt.target.parentNode).data("index");
        //console.debug("click on td", index, tpl.context.get());
        var datacontext = tpl.context.get()[index];
        //console.debug("datacontext", datacontext);
        datacontext.index = index;
        tpl.selected.set(datacontext);
    },
    "click button.btn-new": function (evt, tpl) {
        evt.preventDefault();

        tpl.form_type.set("update-pushArray");
        tpl.form_setArrayItems.set(false);
        tpl.selected.set({});
    },
    "click a.link-remove": function (evt, tpl) {
        evt.preventDefault();

        if (tpl.data.preventRemoval === true) {
            // Skip removing from afFormArrayWrapper
            // Let the event propagate for custom deletion.
            console.debug("Prevent removal inside FormArrayWrapper");
            return;
        }

        var self = this;
        bootbox.confirm("Are you sure?", function (result) {
            if (result != true) {
                return true;
            }
            //var collection = new Mongo.Collection(tpl.data.collection);
            var collection = tpl.data.collection;
            var doc = tpl.data.doc;
            var field = tpl.data.scope;

            // 1 Get the array
            var context = tpl.context.get();
            // 2 Get the index
            var index = $(evt.target).data("index");
            // 3 pull the data
            var removed = context.splice(index, 1);

            // Not sure why I should use compact
            new_value = _.compact(context);

            // 4 update db
            //console.debug("index is ", index);
            //console.debug("_id ",doc._id);
            //console.debug("field", field);
            //console.debug("set", new_value);
            //console.debug("removed", removed);
            var $set = {};
            $set[field] = new_value;
            var update = {
                $set: $set
            };

            collection.update({_id: doc._id}, update, function (err, res) {
                //console.debug("result of update", err, res);
                if (err) {
                    sAlert.error("an error occured");
                }
                return;
            });

            return true;
        });
    }
});
