import React, { useState } from 'react';
import { Input, message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

interface AuditModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (reason: string) => void;
  title?: string;
}

const AuditModal: React.FC<AuditModalProps> = ({ open, onClose, onConfirm, title }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      message.error(t('inventory.audit.reasonRequired', '请填写驳回原因'));
      return;
    }
    onConfirm?.(reason);
    setReason('');
    onClose();
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      title={title || t('inventory.audit.rejectTitle', '驳回原因')}
      open={open}
      onCancel={handleCancel}
      width={400}
      okText={t('inventory.audit.confirmReject', '确认驳回')}
      cancelText={t('inventory.action.cancel', '取消')}
      onOk={handleConfirm}
      okButtonProps={{ danger: true }}
    >
      <TextArea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder={t('inventory.audit.reasonPlaceholder', '请输入驳回原因')}
        maxLength={500}
        showCount
        rows={4}
        style={{ marginTop: 8 }}
      />
    </Modal>
  );
};

export default AuditModal;
