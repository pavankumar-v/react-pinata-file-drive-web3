import React, { useContext, useState } from 'react';
import { DocumentPlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { Button, GetProp, Modal, Upload, UploadFile, UploadProps, message } from 'antd';
import useModal from '@/hooks/useModal';
import { fileUpload } from '@/services/fileUpload.ts';
import { File, PinataFile } from '@/lib/interface';
import { useSDK } from '@metamask/sdk-react-ui';
import { FileDriveContext, FileDriveContextType } from '@/contexts/FileDriveProvider';
import { createFile } from '@/services/fileDrive';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const NewFileUploadButton: React.FC = () => {
  const { isModalOpen, showModal, handleOk, handleCancel } = useModal();
  const [file, setFile] = useState<UploadFile | null>();
  const [uploading, setUploading] = useState(false);
  const { currentFolderId } = useContext(FileDriveContext) as FileDriveContextType;
  const { account } = useSDK();

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file as FileType);
    setUploading(true);

    fileUpload(formData)
      .then((res: PinataFile) => {
        console.log(res);
        const newFile: File = {
          accountId: account,
          fileName: file?.fileName || 'Untitled',
          IpfsHash: res.IpfsHash,
          folderId: currentFolderId,
          PinSize: res.PinSize,
          TimeStamp: res.Timestamp,
        };
        createFile(newFile);
        setFile(null);
        message.success('upload successfully.');
      })
      .catch(() => {
        message.error('upload failed.');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const props: UploadProps = {
    onRemove: () => {
      setFile(null);
    },
    beforeUpload: (file) => {
      setFile(file);

      return false;
    },
  };

  return (
    <>
      <div className="flex items-center gap-2" onClick={showModal}>
        <DocumentPlusIcon width={18} /> New File
      </div>

      <Modal
        title="Upload File"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={file == null}
            loading={uploading}
            style={{ marginTop: 16 }}
            key="uploadBtn"
          >
            {uploading ? 'Uploading' : 'Start Upload'}
          </Button>,
        ]}
      >
        <Upload {...props}>
          <Button icon={<ArrowUpOnSquareIcon width={14} />}>Select File</Button>
        </Upload>
      </Modal>
    </>
  );
};

export default NewFileUploadButton;
