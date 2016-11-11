// Does the browser support html5 input[type='date']
var nativeDateInput = false;

AutoForm.addInputType("smartdate", {
    template: "afSmartInputDate",
    // valueIn: function (val) {
    //     //convert Date to string value
    //     return AutoForm.valueConverters.dateToDateStringUTC(val);
    // },
    valueOut: function () {
        var val = this.val();

        if(nativeDateInput) {
            if (AutoForm.Utility.isValidDateString(val)) {
                //Date constructor will interpret val as UTC and create
                //date at mignight in the morning of val date in UTC time zone
                return new Date(val);
            } else {
                return null;
            }
        } else {
            var val = this.datepicker('getUTCDate');
            // console.debug("datepicker value out", val);
            return (val instanceof Date) ? val : null;
        }
    },
    valueConverters: {
        "string": AutoForm.valueConverters.dateToDateStringUTC,
        "stringArray": AutoForm.valueConverters.dateToDateStringUTCArray,
        "number": AutoForm.valueConverters.dateToNumber,
        "numberArray": AutoForm.valueConverters.dateToNumberArray,
        "dateArray": AutoForm.valueConverters.dateToDateArray
    },
    contextAdjust: function (context) {
        if (typeof context.atts.max === "undefined" && context.max instanceof Date) {
            context.atts.max = AutoForm.valueConverters.dateToDateStringUTC(context.max);
        }
        if (typeof context.atts.min === "undefined" && context.min instanceof Date) {
            context.atts.min = AutoForm.valueConverters.dateToDateStringUTC(context.min);
        }
        return context;
    }
});

Template.afSmartInputDate.onCreated(function () {
    // Test if the browser support html5 input type date
    var tester = document.createElement('input');
    tester.type = "date";
    if(tester.type==="date") {
        nativeDateInput = true;
    }
});

Template.afSmartInputDate.onRendered(function () {
    if(nativeDateInput==false) {
        //$("input[name='profile.birthdate']").mask("99/99/9999");
        console.warn("html5 date input not supported, using datepicker instead");
        var $input = this.data.atts.buttonClasses ? this.$('.input-group.date') : this.$('input');

        // instanciate datepicker
        $input.datepicker({
            format: 'mm/dd/yyyy',
            constrainInput: false,
            changeYear: true,
            changeMonth: true,
            defaultDate:"01/01/1990"  // Relative year/month/day
        });

        // console.debug("setting date to ", this.data.value);
        if(this.data.value) {
            $input.datepicker('setUTCDate', this.data.value);
        }

    }
});

Template.afSmartInputDate.helpers({
    getDate: function() {
        var val = AutoForm.valueConverters.dateToDateStringUTC(this.value);
        return nativeDateInput ? val : "";
    },
    dsk: function dsk() {
        return {
            "data-schema-key": this.atts["data-schema-key"]
        }
    }
});


Template.afSmartInputDate.destroyed = function () {
    if(nativeDateInput==false) {
        var $input = this.data.atts.buttonClasses ? this.$('.input-group.date') : this.$('input');
        $input.datepicker('remove');
    }
};

function utcToLocal(utcDate) {
    var localDateObj = new Date();
    localDateObj.setDate(utcDate.getUTCDate());
    localDateObj.setMonth(utcDate.getUTCMonth());
    localDateObj.setFullYear(utcDate.getUTCFullYear());
    localDateObj.setHours(0);
    localDateObj.setMinutes(0);
    localDateObj.setSeconds(0);
    localDateObj.setMilliseconds(0);
    return localDateObj;
}