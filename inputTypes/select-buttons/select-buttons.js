let i18nPrefix = "";

AutoForm.addInputType("select-buttons", {
    template: "afSelectButtons",
    // Only a single element can be selected if true and it returns a string.
    // Otherwise it will return an array of value.
    singleSelection: false,
    allowFilter: false,

    valueOut: function() {

        let values = [];
        this.find("input:checked").each(function(index, item) {
            // console.debug("checking output", this, index, item);
            values.push(this.value);
        })

        console.debug("values are ", values);
        return this.singleSelection ? values[0] : values;
    },
    contextAdjust: function(context) {
     // A function that adjusts the context object that your custom template receives.
     // That is, this function accepts an object argument, potentially modifies it, and then returns it.
     // That returned object then becomes this in your custom template.
     // If you need access to attributes of the parent autoForm in this function,
     // use AutoForm.getCurrentDataForForm() to get them.


        let itemAtts = _.omit(context.atts);

        this.allowFilter = context.atts.allowFilter || false;
        this.singleSelection = context.atts.singleSelection || false;
        i18nPrefix = context.atts.i18nPrefix || "";

        let colSizeClass = context.atts.colSizeClass || "col-sm-6 col-md-4";

        // Allow disabled image
        let disabledValues = context.atts.disabledValues || [];

        // build items list
        context.items = [];

        // Add all defined options
        _.each(context.selectOptions, function(opt) {
            let selected = context.value == opt.value;
            if(!context.atts.singleSelection) {
                selected = _.contains(context.value, opt.value);
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
                disabled: (_.contains(disabledValues, opt.value)),
                selected: selected,
                atts: itemAtts
            };
            // console.debug("item is ", item);
            context.items.push(item);
        });
        return context;
    }
});

Template.afSelectButtons.onCreated(function() {
    //console.debug("template CUSOTM created",this);
    this.filter = new ReactiveVar(false);
    this.deps = new Tracker.Dependency;
    console.debug("afSelectButtons on created", this);
});
Template.afSelectButtons.onRendered(function() {
    //console.debug("template CUSOTM rendered",this);
    // Hack to display the value on first load
    setTimeout(this.deps.changed, 1000);
});

Template.afSelectButtons.helpers({
    filter: function() {
        var filter = Template.instance().filter.get();
        //console.debug("filter",filter,this.value);
        if(filter && filter.length>0) {
            var found = this.value.toUpperCase().indexOf(filter.toUpperCase())!=-1;
            return !found ? "hidden" : "";
        }
        // No filter has been found, return true to allow value.
        return "";
    },
    format: function(value) {
      return TAPi18n.__(i18nPrefix+value);
    },
    inputType: function() {
        return this.atts.singleSelection ? "radio" : "checkbox";
    },
    isSelected: function() {
        if(this.selected) {
            return "active "+this.atts['activeClasses'];
        }
        return "";
    },
    currentValues: function() {
        var tpl = Template.instance();
        tpl.deps.depend();

        //console.debug("template is ", this, tpl, tpl.firstNode);

        console.debug("currentValue", this.values);
        var values = this.value;
        if(tpl.firstNode!=null) {
            values = $(tpl.firstNode).find("input:checked").map(function() {
                return this.value;
            }).get();
        }

        // Remove empty values
        values = _.filter(values, function(elt) {return elt.length>0;});
        console.debug("current values are", values);
        return values;
    },
    dsk: function () {
        return {'data-schema-key': this.atts['data-schema-key']};
    },
    filterValue: function() {
        var filter = Template.instance().filter.get();
        return filter.length>0 ? filter : "";
    }
});

Template.afSelectButtons.events({
    // "click button.btn_item": function(evt,tpl) {
    //     evt.preventDefault();
    //
    //     var target = $(evt.target);
    //     if(!target.hasClass("active")) {
    //         // Remove previous selection on single mode
    //         if(tpl.data.atts.singleSelection) {
    //             var actives = tpl.$("button.btn_item.active");
    //             //console.debug("reset previous values",actives, $("button.btn_item.active"));
    //             actives.removeClass("active");
    //             actives.removeClass(tpl.data.atts.activeClasses);
    //         }
    //         // Set the active class on current button
    //         target.addClass("active");
    //
    //         if(tpl.data.atts.activeClasses) {
    //             target.addClass(tpl.data.atts.activeClasses);
    //         }
    //     } else {
    //         // Remove active button
    //         target.removeClass(tpl.data.atts.activeClasses);
    //         target.removeClass("active");
    //     }
    //
    //     // Inform the listeners of the change
    //     tpl.deps.changed();
    //
    //     var inputId = this.atts.id;
    //     //console.debug("click on ",target, this, tpl, inputId);
    //
    //     // Backup the current value in the firstNode
    //     // (otherwise AutoForm doesn't detect the value on autosave)
    //     tpl.firstNode.value = evt.target.value;
    //
    //     // Create custom 'blur' event to enable onblur validatino with AutoForm
    //     var evt_change = jQuery.Event("change");
    //     evt_change.target = tpl.firstNode;
    //
    //     var evt_blur = jQuery.Event("blur");
    //     evt_blur.target = tpl.firstNode;
    //
    //     // Make sure autoform can detect the change
    //     // and has compatibility with autosave
    //     var id = AutoForm.getFormId();
    //     //console.debug("triggering change autoform id ",id,evt_blur);
    //     $("#"+id).trigger(evt_change);
    //     $("#"+id).trigger(evt_blur);
    // },
    "click .reset-filter": function(evt, tpl) {
        evt.preventDefault();
        tpl.filter.set(false);
        tpl.find("input.filter").value = "";
    },
    "keyup input.filter": function(evt, tpl) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        if(evt.keyCode==13) {
            // <Enter> has been pressed, update filter value.
            var filter = evt.target.value;
            tpl.filter.set(filter);
        } else if(evt.keyCode==27) {
            // <Esc> reset the filter
            evt.target.value = "";
            tpl.filter.set(false);
        } else {
            var filter = evt.target.value;
            tpl.filter.set(filter);
        }
    }
});
