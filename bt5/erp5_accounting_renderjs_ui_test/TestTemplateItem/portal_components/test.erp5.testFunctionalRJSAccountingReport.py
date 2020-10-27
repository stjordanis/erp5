##############################################################################
#
# Copyright (c) 2011 Nexedi SARL and Contributors. All Rights Reserved.
#                     Kazuhiko <kazuhiko@nexedi.com>
#                     Rafael Monnerat <rafael@nexedi.com>
#
# WARNING: This program as such is intended to be used by professional
# programmers who take the whole responsability of assessing all potential
# consequences resulting from its eventual inadequacies and bugs
# End users who are looking for a ready-to-use solution with commercial
# garantees and support are strongly adviced to contract a Free Software
# Service Company
#
# This program is Free Software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
#
##############################################################################
import unittest

from AccessControl import getSecurityManager
from Products.ERP5Type.tests.ERP5TypeFunctionalTestCase import ERP5TypeFunctionalTestCase

class TestRenderJSAccountingReport(ERP5TypeFunctionalTestCase):
  foreground = 0
  run_only = "renderjs_ui_accounting_report_zuite"

  def afterSetUp(self):
    # change ownership of the preference
    self.portal.portal_preferences.accounting_zuite_preference.changeOwnership(
      getSecurityManager().getUser(),
      True,
    )
    super(TestRenderJSAccountingReport, self).afterSetUp()

  def getBusinessTemplateList(self):
    return (
      'erp5_accounting_renderjs_ui_test',
    )

def test_suite():
  suite = unittest.TestSuite()
  suite.addTest(unittest.makeSuite(TestRenderJSAccountingReport))
  return suite