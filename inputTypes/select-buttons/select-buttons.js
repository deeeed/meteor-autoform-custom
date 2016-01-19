AutoForm.addInputType("select-buttons", {
    template: "afSelectButtons",
    valueIsArray: true,
    valueIn: function() {
        // A function that adjusts the initial value of the field,
        // which is then available in your template as this.value.
        // You could use this, for example, to change a Date object to a string representing the date.
        // You could also use a helper in your template to achieve the same result.
        console.debug("valueIn",this);
        return this.value;
    },
    valueOut: function() {
        // A function that AutoForm calls when it wants to know what the current value stored in your widget is.
        // In this function, this is the jQuery object representing the element that has the data-schema-key
        // attribute in your custom template. So, for example, in a simple case your valueOut function might
        // just do return this.val().
        var values = $(this[0]).find("button.btn_item.active").map(function() {
            return $(this).text();
        }).get();
        console.debug("valueOut: buttons are ",values);
        return values;
    },
    contextAdjust: function(context) {
        // A function that adjusts the context object that your custom template receives.
        // That is, this function accepts an object argument, potentially modifies it, and then returns it.
        // That returned object then becomes this in your custom template.
        // If you need access to attributes of the parent autoForm in this function,
        // use AutoForm.getCurrentDataForForm() to get them.
        console.debug("contextAdjust",context);
        if(context.allowFilter) {
            console.info("allowing filter");
        }
        context.items = _.map(context.selectOptions, function(opt) {
           return {
               name: context.name,
               label: opt.label,
               value: opt.value,
               htmlAtts: _.omit(opt, 'label', 'value'),
               // _id must be included because it is a special property that
               // #each uses to track unique list items when adding and removing them
               // See https://github.com/meteor/meteor/issues/2174
               _id: opt.value,
               selected: _.contains(context.value, opt.value),
               atts: context.atts
           };
        });
        return context;
    }
});

Template.afSelectButtons.onCreated(function() {
    console.debug("template CUSOTM created",this);
    this.filter = new ReactiveVar(false);
});
Template.afSelectButtons.onRendered(function() {
    console.debug("template CUSOTM rendered",this);
});

Template.afSelectButtons.helpers({
    filter: function() {
        var filter = Template.instance().filter.get();
        console.debug("filter",filter,this.value);
        if(filter && filter.length>0) {
            var found = this.value.indexOf(filter)!=-1;
            return found;
        }
        // No filter has been found, return true to allow value.
        return true;
    }
});

Template.afSelectButtons.events({
    "click button.btn-item": function(evt,tpl) {
        evt.preventDefault();
        var target = evt.target;
        console.debug("click on ",target, this);
    },
    "keyup input.filter": function(evt, tpl) {
        if(evt.keyCode==13) {
            // <Enter> has been pressed, update filter value.
            var filter = evt.target.value;
            tpl.filter.set(filter);
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        } else if(evt.keyCode==27) {
            // <Esc> reset the filter
            evt.target.value = "";
            tpl.filter.set(false);
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        }
    }
});