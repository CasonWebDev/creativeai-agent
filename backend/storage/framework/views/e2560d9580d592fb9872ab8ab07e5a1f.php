<?php $__env->startComponent('mail::message'); ?>
# Welcome to CreativeAI!

Hi <?php echo e($user->name); ?>,

Welcome to CreativeAI! Your account has been successfully confirmed and is ready to use.

You can now log in to access all the features:

<?php $__env->startComponent('mail::button', ['url' => $dashboardUrl]); ?>
Login to Your Account
<?php echo $__env->renderComponent(); ?>

**Your Tier:** <?php echo e(ucfirst($user->tier)); ?>


If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Thanks,<br>
The CreativeAI Team

<?php echo $__env->renderComponent(); ?>
<?php /**PATH /app/resources/views/emails/welcome.blade.php ENDPATH**/ ?>