let i18nPrefix = "";

AutoForm.addInputType("select-buttons", {
    template: "afSelectButtons",
    // Only a single element can be selected if true and it returns a string.
    // Otherwise it will return an array of value.
    singleSelection: false,
    allowFilter: false,

    valueOut: function() {
        // A function that AutoForm calls when it wants to know what the current value stored in your widget is.
        // In this function, this is the jQuery object representing the element that has the data-schema-key
        // attribute in your custom template. So, for example, in a simple case your valueOut function might
        // just do return this.val().

        // console.debug("this out",this,this[0]);
        var values = $(this[0]).find("button.btn_item.active").map(function() {
            return this.value;
        }).get();

        var valueIsArray = this.context.getAttribute("valueIsArray");
        if("false"==valueIsArray) {
            values = values.join("");
        }

        var dsk =  this[0].getAttribute("data-schema-key");
        // console.debug(dsk+": ",values);

        return values;
    },
    contextAdjust: function(context) {
        // A function that adjusts the context object that your custom template receives.
        // That is, this function accepts an object argument, potentially modifies it, and then returns it.
        // That returned object then becomes this in your custom template.
        // If you need access to attributes of the parent autoForm in this function,
        // use AutoForm.getCurrentDataForForm() to get them.

        // console.debug("contextAdjust",context);
        this.allowFilter = context.atts.allowFilter;
        this.singleSelection = context.atts.singleSelection || false;
        let colSizeClass = context.atts.colSizeClass || "col-sm-6 col-md-4";
        i18nPrefix = context.atts.i18nPrefix || "";

        context.items = _.map(context.selectOptions, function(opt) {
            var selected = context.value.indexOf(opt.value)!=-1;
            // console.debug(context.value, opt,selected);
            return {
                name: context.name,
                label: opt.label,
                colSizeClass: colSizeClass,
                value: opt.value,
                htmlAtts: _.omit(opt, 'label', 'value'),
                // _id must be included because it is a special property that
                // #each uses to track unique list items when adding and removing them
                // See https://github.com/meteor/meteor/issues/2174
                _id: opt.value,
                selected: selected,
                atts: context.atts
            };
        });
        return context;
    }
});

Template.afSelectButtons.onCreated(function() {
    //console.debug("template CUSOTM created",this);
    this.filter = new ReactiveVar(false);
    this.deps = new Tracker.Dependency;
});
Template.afSelectButtons.onRendered(function() {
    //console.debug("template CUSOTM rendered",this);
    // Hack to display the value on first load
    Meteor.setTimeout(() => {
        this.deps.changed();
    }, 2000);
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
    isSelected: function() {
        if(this.selected) {
            return "active "+this.atts['activeClasses'];
        }
        return "";
    },
    format: function(value) {
        return TAPi18n.__(i18nPrefix+value);
    },
    currentValues: function() {
        var tpl = Template.instance();
        tpl.deps.depend();

        var values = this.value;
        // console.debug("currentValues ", values);

        if(tpl.firstNode!=null) {
            let mapper = $(tpl.firstNode).find("button.btn_item.active");
            values = mapper.map(function() {
                return this.value;
            }).get();
        }

        // Remove empty values
        values = _.filter(values, function(elt) {return elt.length>0;});
        // console.debug("current values are", values);
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
    "click button.btn_item": function(evt,tpl) {
        evt.preventDefault();

        var target = $(evt.target);
        if(!target.hasClass("active")) {
            // Remove previous selection on single mode
            if(tpl.data.atts.singleSelection) {
                var actives = tpl.$("button.btn_item.active");
                //console.debug("reset previous values",actives, $("button.btn_item.active"));
                actives.removeClass("active");
                actives.removeClass(tpl.data.atts.activeClasses);
            }
            // Set the active class on current button
            target.addClass("active");

            if(tpl.data.atts.activeClasses) {
                target.addClass(tpl.data.atts.activeClasses);
            }
        } else {
            // Remove active button
            target.removeClass(tpl.data.atts.activeClasses);
            target.removeClass("active");
        }

        // Inform the listeners of the change
        tpl.deps.changed();

        var inputId = this.atts.id;
        //console.debug("click on ",target, this, tpl, inputId);

        // Backup the current value in the firstNode
        // (otherwise AutoForm doesn't detect the value on autosave)
        tpl.firstNode.value = evt.target.value;

        // Create custom 'blur' event to enable onblur validatino with AutoForm
        var evt_change = jQuery.Event("change");
        evt_change.target = tpl.firstNode;

        var evt_blur = jQuery.Event("blur");
        evt_blur.target = tpl.firstNode;

        // Make sure autoform can detect the change
        // and has compatibility with autosave
        var id = AutoForm.getFormId();
        //console.debug("triggering change autoform id ",id,evt_blur);
        $("#"+id).trigger(evt_change);
        $("#"+id).trigger(evt_blur);
    },
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

Template.afSelectButtons.onDestroyed(function() {
});
