import React from 'react';
import { get } from 'lodash';
import politicalImagePopupRender from '../MachineLabel/politicalImagePopupRender';
import overAdPopupRender from '../MachineLabel/overAdPopupRender';
import LimitEditReasonDescription from '../reject-reason-drawer/components/RejectReasonDrawer/SelectedRejestInfos/LimitEditReasonDescription';
import { initReasonBracketInfo } from '../reject-reason-drawer/utils/reasonBracketInfoInit';
import { businessAiMap } from '../../consts/ExtraInfoKeyMap';
import { noReasonBusinessAiList } from '../../container/pipeline/buildInitReasons';

export const getLabelList = (reason) => {
  const { elements } = reason || {};
  const labelAnnotationType = get(reason, 'reason.labelAnnotationType');
  switch (labelAnnotationType) {
    case 1:
      return get(elements, '[0].classificationAnnotation') ? [get(elements, '[0].classificationAnnotation')] : [];
    case 2:
      return get(elements, '[0].attributeAnnotations') || [];
    case 3:
      return get(elements, '[0].labelLocationAnnotations') || [];
    default:
      return [];
  }
};

export const getTipPopup = (aiPrediction = {}) => {
  const { businessAi } = aiPrediction || {};
  switch (businessAi) {
    case businessAiMap.POLITICAL_IMAGE:
      return politicalImagePopupRender(aiPrediction);
    case businessAiMap.MEDICINE_OUT:
      return overAdPopupRender(aiPrediction);
    default:
      return null;
  }
};

export const hasReason = (reason) => {
  const businessAi = get(reason, 'aiPrediction.businessAi');
  return !(noReasonBusinessAiList.includes(businessAi) && !get(reason, 'aiPrediction.policyId'));
};

export const getRemove = (reason) => {
  return reason?.remove && hasReason(reason);
};

export const getReasonText = (reasonItem, selectedReasonId, onReasonInfoChange) => {
  const { aiPrediction = {}, reason } = reasonItem || {};
  const policyId = get(aiPrediction, 'policyId');
  if (!policyId) {
    const businessAi = get(aiPrediction, 'businessAi');
    switch (businessAi) {
      case businessAiMap.MEDICINE_OUT:
        return '未超广审';
      case businessAiMap.MUSE_DIGITAL_HUMAN_VIDEO: {
        const labelLocationPredictions = get(aiPrediction, 'labelLocationPredictions') || [];
        const cnameList = labelLocationPredictions.map((item) => get(item, 'label.cname'));
        return `妙思数字人 (${Array.from(new Set(cnameList)).length}个)`;
      }
    }
  }
  const { reviewPolicyName, threeLevelAbbreviation, description } = reason || {};
  const isCreativeLevelReason = reason.applyType === 'Creative' && reason.version === 2;

  return get(initReasonBracketInfo(reason), 'needCompose') ? (
    <LimitEditReasonDescription
      onReasonInfoChange={onReasonInfoChange}
      reason={reason}
      showThreeLevelAbbreviation
      selectedReasonId={selectedReasonId}
    />
  ) : (
    (isCreativeLevelReason && reviewPolicyName) || threeLevelAbbreviation || description
  );
};
