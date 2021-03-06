AutoForm.addInputType("select-pictures", {
    template: "afSelectPictures",
    // Only a single element can be selected if true and it returns a string.
    // Otherwise it will return an array of value.

    valueOut: function() {
        var val = null;
        // valueOut: Required. A function that AutoForm calls when it wants to know what the current value stored
        // in your widget is. In this function, this is the jQuery object representing the element
        // that has the data-schema-key attribute in your custom template.
        // So, for example, in a simple case your valueOut function might just do return this.val().

        let singleSelection = this.data("single-selection");
        // console.debug("outputing now", this.data("schema-key"));
        if(!singleSelection) {
            val = [];
            this.find('input[type=checkbox]').each(function () {
                if ($(this).is(":checked")) {
                    val.push($(this).val());
                }
            });
        } else {
            val = this.find('input[type=radio]:checked').val();
        }

        // console.debug("ouput values are ", val);
        return val;
    },
    contextAdjust: function(context) {
        // A function that adjusts the context object that your custom template receives.
        // That is, this function accepts an object argument, potentially modifies it, and then returns it.
        // That returned object then becomes this in your custom template.
        // If you need access to attributes of the parent autoForm in this function,
        // use AutoForm.getCurrentDataForForm() to get them.
        var itemAtts = lodash.omit(context.atts);


        // Allow disabled image
        let disabledValues = context.atts.disabledValues || [];

        // build items list
        context.items = [];

        // console.debug("context is ", context);

        // Add all defined options
        lodash.each(context.selectOptions, function(opt) {
            let selected = context.value == opt.value;
            if(!context.atts.singleSelection) {
                selected = lodash.includes(context.value, opt.value);
            }
            let item = {
                name: context.name,
                label: opt.value,
                value: opt.value,
                image: opt.image,
                // _id must be included because it is a special property that
                // #each uses to track unique list items when adding and removing them
                // See https://github.com/meteor/meteor/issues/2174
                _id: opt.value,
                disabled: (lodash.includes(disabledValues, opt.value)),
                selected: selected,
                atts: itemAtts
            };
            // console.debug("item is ", item);
            context.items.push(item);
        });

        return context;
    }
});

Template.afSelectPictures.onCreated(function() {
    //console.debug("template CUSOTM created",this);
});
Template.afSelectPictures.onRendered(function() {
    //console.debug("template CUSOTM rendered",this);
    // Hack to display the value on first load
    // setTimeout(this.deps.changed, 2000);
});

Template.afSelectPictures.helpers({
    atts: function selectedAttsAdjust() {
        var atts = lodash.clone(this.atts);
        if (this.selected) {
            atts.checked = "";
        }
        // remove data-schema-key attribute because we put it
        // on the entire group
        delete atts["data-schema-key"];
        return atts;
    },
    format: function(value) {
        let prefix = this.atts.i18nPrefix || "";
        return TAPi18n.__(prefix+value);
    },
    inputType: function() {
        return this.atts.singleSelection ? "radio" : "checkbox";
    },
    singleSelection: function () {
        return {'data-single-selection': this.atts['singleSelection']};
    },
    dsk: function () {
        return {'data-schema-key': this.atts['data-schema-key']};
    }
});
