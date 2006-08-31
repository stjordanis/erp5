# FIXME: provide icon for the field

from Products.Formulator.Field import ZMIField
from Products.Formulator.Widget import LabelWidget, render_element
from Products.Formulator.DummyField import fields
from Products.Formulator import Validator

class HyperLinkWidget(LabelWidget):
    property_names = LabelWidget.property_names + ['href']

    href = fields.LinkField('href',
                           title='Href',
                           description='Address of this link',
                           default="",
                           required=1)

    def render(self, field, key, value, REQUEST):
        return render_element("a",
                              href=field.get_value('href'),
                              css_class=field.get_value('css_class'),
                              contents=field.get_value('default'))

HyperLinkWidgetInstance = HyperLinkWidget()

class HyperLinkField(ZMIField):
    """ Hyperlink field
    """
    meta_type = "HyperLinkField"
    
    widget = HyperLinkWidgetInstance
    validator = Validator.SuppressValidatorInstance

