AutoForm.addInputType("select-progressive", {
    template: "afSelectProgressive",
    valueOut: function () {
        return this.find('input[type=radio]:checked').val();
    },
    contextAdjust: function (context) {
        var itemAtts = _.omit(context.atts);

        // build items list
        context.items = [];

        // console.debug("adjusting context in select-progressive", context, this.value);
        this.value = context.value;

        // Add all defined options
        _.each(context.selectOptions, function(opt) {
            let selected = opt.value === context.value;
            // console.debug(`${opt.value} == ${context.value} --> ${selected}`);
            context.items.push({
                name: context.name,
                label: opt.label,
                value: opt.value,
                // _id must be included because it is a special property that
                // #each uses to track unique list items when adding and removing them
                // See https://github.com/meteor/meteor/issues/2174
                _id: opt.value,
                selected: selected,
                atts: itemAtts
            });
        });

        return context;
    }
});

Template.afSelectProgressive.onRendered(function() {
    // console.debug("rendering selectprogressive");
});

Template.afSelectProgressive.helpers({
    atts: function selectedAttsAdjust() {
        var atts = _.clone(this.atts);
        if (this.selected) {
            atts.checked = "";
        }
        // console.debug("atts is ", atts);
        // remove data-schema-key attribute because we put it
        // on the entire group
        delete atts["data-schema-key"];
        return atts;
    },
    format: function(value) {
        return TAPi18n.__(value);
    },
    dsk: function dsk() {
        return {
            "data-schema-key": this.atts["data-schema-key"]
        };
    }
});

Template.afSelectProgressive.events({
});

Template.afSelectProgressive.onDestroyed(function() {
   // console.debug("destroying afSelectProgressive");
});